<?php

namespace App\Exceptions;

use Exception;

/**
 * Dilempar oleh StockService saat stok tidak mencukupi.
 * Otomatis dirender sebagai JSON 422 oleh bootstrap/app.php.
 */
class InsufficientStockException extends Exception
{
    public function __construct(string $message = 'Stok tidak mencukupi.')
    {
        parent::__construct($message);
    }
}
