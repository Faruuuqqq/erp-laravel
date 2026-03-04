<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ExpenseController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $query = Expense::with('creator')
            ->search($request->search);

        if ($request->category) {
            $query->where('category', $request->category);
        }
        if ($request->from) {
            $query->whereDate('date', '>=', $request->from);
        }
        if ($request->to) {
            $query->whereDate('date', '<=', $request->to);
        }

        $expenses = $query->latest('date')->paginate($request->perPage ?? 25);

        return ExpenseResource::collection($expenses);
    }

    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $latestExpense = Expense::orderBy('id', 'desc')->first();
        $nextId = $latestExpense ? $latestExpense->id + 1 : 1;
        $code = 'BOP-' . now()->format('Ymd') . '-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

        $expense = Expense::create([
            'code'        => $code,
            'date'        => $request->date,
            'category'    => $request->category,
            'description' => $request->description,
            'amount'      => $request->amount,
            'created_by'  => auth()->id(),
        ]);

        return response()->json([
            'data'    => new ExpenseResource($expense->load('creator')),
            'message' => 'Biaya operasional berhasil ditambahkan.',
        ], 201);
    }

    public function show(Expense $expense): JsonResponse
    {
        return response()->json([
            'data' => new ExpenseResource($expense->load('creator')),
        ]);
    }

    public function update(Request $request, Expense $expense): JsonResponse
    {
        $validated = $request->validate([
            'date'        => ['nullable', 'date'],
            'category'    => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'amount'      => ['nullable', 'numeric', 'min:0'],
        ]);

        $expense->update($validated);

        return response()->json([
            'data'    => new ExpenseResource($expense->fresh('creator')),
            'message' => 'Biaya operasional berhasil diperbarui.',
        ]);
    }

    public function destroy(Expense $expense): JsonResponse
    {
        $expense->delete();

        return response()->json([
            'message' => 'Biaya operasional berhasil dihapus.',
        ]);
    }
}
