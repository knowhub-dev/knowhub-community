<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\WikiArticle;

class WikiWebController extends Controller
{
    public function index()
    {
        $articles = WikiArticle::latest()->paginate(10);

        return view('wiki.index', compact('articles'));
    }

    public function show(string $slug)
    {
        $article = WikiArticle::where('slug', $slug)->firstOrFail();

        return view('wiki.show', compact('article'));
    }

    public function create()
    {
        return view('wiki.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:180',
            'content_markdown' => 'required|string',
        ]);

        $article = WikiArticle::create([
            'title' => $data['title'],
            'content_markdown' => $data['content_markdown'],
            'status' => 'published',
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('wiki.show', $article->slug)
            ->with('success', 'Wiki maqola muvaffaqiyatli yaratildi!');
    }
}
