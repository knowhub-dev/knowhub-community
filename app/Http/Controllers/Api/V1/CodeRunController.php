<?php

// file: app/Http/Controllers/Api/V1/CodeRunController.php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CodeRunRequest;
use App\Models\CodeRun;
use App\Models\Post;
use App\Services\CodeRun\CodeRunner;
use Illuminate\Http\JsonResponse;

class CodeRunController extends Controller
{
    public function __construct(private readonly CodeRunner $runner)
    {
    }

    public function submit(CodeRunRequest $req): JsonResponse
    {
        $this->authorize('create', CodeRun::class);

        $source = $req->input('code', $req->input('source'));
        if ($source === null) {
            return response()->json(['message' => 'Code snippet is required.'], 422);
        }

        $postId = null;
        if ($slug = $req->input('post_slug')) {
            $postId = Post::where('slug', $slug)->value('id');
        }

        $codeRun = $this->runner->submit(
            $req->user(),
            $req->input('language'),
            $source,
            $postId,
            $req->input('comment_id')
        );

        return response()->json(['run_id' => $codeRun->id], 202);
    }

    public function show(CodeRun $codeRun): JsonResponse
    {
        $this->authorize('view', $codeRun);

        return response()->json($codeRun->only([
            'id',
            'status',
            'stdout',
            'stderr',
            'runtime_ms',
            'exit_code',
        ]));
    }
}
