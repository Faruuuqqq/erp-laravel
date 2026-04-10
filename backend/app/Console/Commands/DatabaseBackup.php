<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use DateTime;

class DatabaseBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:database-backup';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Create a database backup and store it locally';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $backupPath = $this->createBackup();
            
            $this->info("✓ Database backup created successfully at: {$backupPath}");
            
            // Clean old backups (keep only 12 months worth)
            $this->cleanOldBackups();
            
            return 0;
        } catch (\Exception $e) {
            $this->error("✗ Backup failed: {$e->getMessage()}");
            return 1;
        }
    }

    /**
     * Create database backup using mysqldump or sqlite commands
     */
    private function createBackup(): string
    {
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

        return "storage/app/backups/{$filename}";
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

        $command = sprintf(
            'mysqldump -h%s -P%s -u%s %s > %s',
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($username),
            escapeshellarg($database),
            escapeshellarg($filepath)
        );

        if ($password) {
            // Add password safely
            $command = sprintf(
                'mysqldump -h%s -P%s -u%s -p%s %s > %s',
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($username),
                escapeshellarg($password),
                escapeshellarg($database),
                escapeshellarg($filepath)
            );
        }

        $output = null;
        $returnVar = null;

        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            throw new \Exception("mysqldump command failed with return code {$returnVar}");
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
        $maxBackups = 12; // Keep 12 monthly backups

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
                    $this->info("Deleted old backup: {$file}");
                }
            }
        }
    }
}
