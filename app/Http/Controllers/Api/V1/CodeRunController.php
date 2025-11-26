<?php
// file: app/Http/Controllers/Api/V1/CodeRunController.php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CodeRunRequest;
use App\Models\CodeRun;
use App\Models\Post;
use App\Services\CodeRun\CodeRunner;
use Illuminate\Support\Facades\DB;

class CodeRunController extends Controller
{
    public function __construct(private CodeRunner $runner) {}

    public function run(CodeRunRequest $req)
    {
        $data = $req->validated();
        $postId = null;
        if (!empty($data['post_slug'])) {
            $postId = Post::where('slug',$data['post_slug'])->value('id');
        }

        $run = CodeRun::create([
            'user_id' => $req->user()->id,
            'post_id' => $postId,
            'comment_id' => $data['comment_id'] ?? null,
            'language' => $data['language'] === 'js' ? 'javascript' : $data['language'],
            'source' => $data['code'],
            'status' => 'running',
        ]);

        $result = $this->runner->run($req->user(), $run->language, $run->source);

        DB::transaction(function () use ($run, $result) {
            $run->stdout = $result['stdout'];
            $run->stderr = $result['stderr'];
            $run->exit_code = $result['code'];
            $run->runtime_ms = $result['time_ms'];
            $run->status = $result['code'] === 0 ? 'success' : 'failed';
            $run->save();
        });

        return $run->only(['id','language','stdout','stderr','exit_code','runtime_ms','status']);
    }
}

