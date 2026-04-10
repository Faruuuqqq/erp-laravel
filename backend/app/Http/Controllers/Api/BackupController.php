<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class BackupController extends Controller
{
    /**
     * Get list of all backups
     */
    public function index(): JsonResponse
    {
        try {
            $backupDir = storage_path('app/backups');

            if (!is_dir($backupDir)) {
                return response()->json([
                    'data' => [],
                    'message' => 'No backups found'
                ]);
            }

            $files = array_diff(scandir($backupDir, SCANDIR_SORT_DESCENDING), ['.', '..']);
            $backups = [];

            foreach ($files as $file) {
                if (str_ends_with($file, '.sql')) {
                    $filepath = "{$backupDir}/{$file}";
                    $backups[] = [
                        'filename' => $file,
                        'size' => filesize($filepath),
                        'size_formatted' => $this->formatBytes(filesize($filepath)),
                        'created_at' => date('Y-m-d H:i:s', filemtime($filepath)),
                        'timestamp' => filemtime($filepath),
                    ];
                }
            }

            // Sort by creation date descending
            usort($backups, fn($a, $b) => $b['timestamp'] <=> $a['timestamp']);

            return response()->json([
                'data' => $backups,
                'count' => count($backups),
                'message' => 'Backups retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve backups: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new backup manually
     */
    public function create(Request $request): JsonResponse
    {
        try {
            $backupDir = storage_path('app/backups');

            // Create backup directory if it doesn't exist
            if (!is_dir($backupDir)) {
                mkdir($backupDir, 0755, true);
            }

            $connection = config('database.default');
            $timestamp = now()->format('Y-m-d_H-i-s');
            $filename = "tokosync_erp_{$timestamp}.sql";
            $filepath = "{$backupDir}/{$filename}";

            if ($connection === 'mysql' || $connection === 'mariadb') {
                $this->backupMySQL($filepath);
            } elseif ($connection === 'sqlite') {
                $this->backupSQLite($filepath);
            } else {
                throw new \Exception("Unsupported database connection: {$connection}");
            }

            // Clean up old backups
            $this->cleanOldBackups();

            return response()->json([
                'data' => [
                    'filename' => $filename,
                    'size' => filesize($filepath),
                    'size_formatted' => $this->formatBytes(filesize($filepath)),
                    'created_at' => date('Y-m-d H:i:s'),
                ],
                'message' => 'Backup created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Backup failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download a backup file
     */
    public function download(string $filename): Response
    {
        try {
            // Validate filename to prevent directory traversal
            if (preg_match('/[^a-zA-Z0-9._-]/', $filename)) {
                return response('Invalid filename', 400);
            }

            $filepath = storage_path("app/backups/{$filename}");

            if (!file_exists($filepath)) {
                return response('Backup file not found', 404);
            }

            if (!str_ends_with($filename, '.sql')) {
                return response('Invalid file type', 400);
            }

            return response()->download($filepath, $filename, [
                'Content-Type' => 'application/sql',
            ]);
        } catch (\Exception $e) {
            return response('Download failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete a backup file
     */
    public function delete(string $filename): JsonResponse
    {
        try {
            // Validate filename to prevent directory traversal
            if (preg_match('/[^a-zA-Z0-9._-]/', $filename)) {
                return response()->json(['message' => 'Invalid filename'], 400);
            }

            $filepath = storage_path("app/backups/{$filename}");

            if (!file_exists($filepath)) {
                return response()->json(['message' => 'Backup file not found'], 404);
            }

            if (!str_ends_with($filename, '.sql')) {
                return response()->json(['message' => 'Invalid file type'], 400);
            }

            if (!unlink($filepath)) {
                throw new \Exception('Failed to delete file');
            }

            return response()->json([
                'message' => 'Backup deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Delete failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Backup MySQL database using mysqldump
     */
    private function backupMySQL(string $filepath): void
    {
        $host = config('database.connections.mysql.host');
        $port = config('database.connections.mysql.port');
        $database = config('database.connections.mysql.database');
        $username = config('database.connections.mysql.username');
        $password = config('database.connections.mysql.password');

        $command = [
            'mysqldump',
            "--host={$host}",
            "--port={$port}",
            "--user={$username}",
            $database,
        ];

        if ($password) {
            array_splice($command, 3, 0, ["--password={$password}"]);
        }

        $process = new Process($command);
        $process->mustRun();

        $output = $process->getOutput();

        if (!file_put_contents($filepath, $output)) {
            throw new \Exception('Failed to write backup file');
        }
    }

    /**
     * Backup SQLite database by copying the file
     */
    private function backupSQLite(string $filepath): void
    {
        $database = config('database.connections.sqlite.database');

        if (!file_exists($database)) {
            throw new \Exception("SQLite database file not found: {$database}");
        }

        if (!copy($database, $filepath)) {
            throw new \Exception("Failed to copy SQLite database to backup location");
        }
    }

    /**
     * Clean up old backups (keep only 12 files)
     */
    private function cleanOldBackups(): void
    {
        $backupDir = storage_path('app/backups');
        $maxBackups = 12;

        if (!is_dir($backupDir)) {
            return;
        }

        $files = array_diff(scandir($backupDir, SCANDIR_SORT_DESCENDING), ['.', '..']);
        $sqlFiles = array_filter($files, fn($file) => str_ends_with($file, '.sql'));

        if (count($sqlFiles) > $maxBackups) {
            $filesToDelete = array_slice($sqlFiles, $maxBackups);

            foreach ($filesToDelete as $file) {
                $filePath = "{$backupDir}/{$file}";
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }
        }
    }

    /**
     * Format bytes to human-readable size
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
