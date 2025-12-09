<?php

// file: app/Http/Controllers/Api/V1/WikiArticleController.php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WikiArticle;
use App\Models\WikiProposal;
use App\Support\Diff\LineDiffer;
use Illuminate\Http\Request;

class WikiArticleController extends Controller
{
    public function index()
    {
        return WikiArticle::select('id', 'title', 'slug', 'status', 'version', 'created_at')->orderByDesc('id')->paginate(20);
    }

    public function show(string $slug)
    {
        $a = WikiArticle::with(['creator.level'])->where('slug', $slug)->firstOrFail();
        $a->append('user');

        return $a;
    }

    public function store(Request $req)
    {
        $data = $req->validate([
            'title' => 'required|string|max:180',
            'content_markdown' => 'required|string',
        ]);
        $a = WikiArticle::create([
            'title' => $data['title'],
            'content_markdown' => $data['content_markdown'],
            'status' => 'published',
            'created_by' => $req->user()->id,
            'updated_by' => $req->user()->id,
        ]);
        $a->load('creator.level');
        $a->append('user');

        return $a;
    }

    public function proposeEdit(Request $req, string $slug)
    {
        $data = $req->validate([
            'content_markdown' => 'required|string',
            'comment' => 'nullable|string|max:300',
        ]);
        $a = WikiArticle::where('slug', $slug)->firstOrFail();
        $p = WikiProposal::create([
            'article_id' => $a->id,
            'user_id' => $req->user()->id,
            'content_markdown' => $data['content_markdown'],
            'comment' => $data['comment'] ?? null,
            'status' => 'pending',
        ]);

        return $p;
    }

    public function merge(Request $req, string $slug, int $proposalId)
    {
        // MVP: faqat article creator merge qila oladi
        $a = WikiArticle::where('slug', $slug)->firstOrFail();
        if ($a->created_by !== $req->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $p = WikiProposal::where('article_id', $a->id)->findOrFail($proposalId);
        $a->content_markdown = $p->content_markdown;
        $a->version = $a->version + 1;
        $a->updated_by = $req->user()->id;
        $a->save();
        $p->status = 'merged';
        $p->save();
        $a->load('creator.level');
        $a->append('user');

        return $a;
    }

    public function proposals(string $slug)
    {
        $article = WikiArticle::where('slug', $slug)->firstOrFail();

        $proposals = $article->proposals()
            ->with(['user:id,name,username,avatar_url'])
            ->latest()
            ->get()
            ->map(function (WikiProposal $proposal) {
                return [
                    'id' => $proposal->id,
                    'status' => $proposal->status,
                    'comment' => $proposal->comment,
                    'created_at' => $proposal->created_at,
                    'user' => $proposal->user ? [
                        'id' => $proposal->user->id,
                        'name' => $proposal->user->name,
                        'username' => $proposal->user->username,
                        'avatar_url' => $proposal->user->avatar_url,
                    ] : null,
                ];
            })
            ->values();

        return response()->json([
            'article' => [
                'id' => $article->id,
                'title' => $article->title,
                'slug' => $article->slug,
                'version' => $article->version,
            ],
            'proposals' => $proposals,
        ]);
    }

    public function diff(string $slug, int $proposalId)
    {
        $article = WikiArticle::where('slug', $slug)->firstOrFail();
        $proposal = $article->proposals()->with(['user:id,name,username,avatar_url'])->findOrFail($proposalId);

        $differ = new LineDiffer;
        $result = $differ->compare($article->content_markdown, $proposal->content_markdown);

        $raw = $differ->render(
            $result['lines'],
            sprintf('%s (v%s)', $article->title, $article->version),
            sprintf('Taklif #%d', $proposal->id)
        );

        return response()->json([
            'article' => [
                'id' => $article->id,
                'title' => $article->title,
                'slug' => $article->slug,
                'version' => $article->version,
            ],
            'proposal' => [
                'id' => $proposal->id,
                'status' => $proposal->status,
                'comment' => $proposal->comment,
                'created_at' => $proposal->created_at,
                'user' => $proposal->user ? [
                    'id' => $proposal->user->id,
                    'name' => $proposal->user->name,
                    'username' => $proposal->user->username,
                    'avatar_url' => $proposal->user->avatar_url,
                ] : null,
            ],
            'summary' => [
                'added' => $result['added'],
                'removed' => $result['removed'],
                'net' => $result['added'] - $result['removed'],
            ],
            'diff' => [
                'raw' => $raw,
                'lines' => $result['lines'],
            ],
        ]);
    }
}
