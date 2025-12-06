<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function postReport(Request $request, int $id)
    {
        $data = $request->validate([
            'reason' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
        ]);

        $post = Post::findOrFail($id);

        $report = Report::create([
            'reporter_id' => $request->user()->id,
            'reportable_type' => Post::class,
            'reportable_id' => $post->id,
            'reason' => $data['reason'],
            'description' => $data['description'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Post reported successfully.',
            'report_id' => $report->id,
            'status' => $report->status,
        ], 201);
    }

    public function userReport(Request $request, string $username)
    {
        $data = $request->validate([
            'reason' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
        ]);

        $user = User::where('username', $username)->firstOrFail();

        $report = Report::create([
            'reporter_id' => $request->user()->id,
            'reportable_type' => User::class,
            'reportable_id' => $user->id,
            'reason' => $data['reason'],
            'description' => $data['description'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'User reported successfully.',
            'report_id' => $report->id,
            'status' => $report->status,
        ], 201);
    }
}
