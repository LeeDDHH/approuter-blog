import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { lookup } from 'mime-types';
import { type NextRequest, NextResponse } from 'next/server';

export const handler = async (request: NextRequest, { params }: { params: { path: string[] } }) => {
  // GETリクエスト以外はエラーを返す
  if (request.method !== 'GET') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405, headers: { Allow: 'GET' } }
    );
  }

  try {
    const filePath = path.join(process.cwd(), 'posts', 'images', ...params.path);

    // セキュリティ: posts/images配下以外へのアクセスを防ぐ
    const postsImagesDir = path.join(process.cwd(), 'posts', 'images');
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(postsImagesDir))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // ファイルの存在確認
    const stats = await stat(filePath);
    if (!stats.isFile()) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // ファイルを読み込み
    const fileBuffer = await readFile(filePath);

    // MIMEタイプを取得
    const mimeType = lookup(filePath) || 'application/octet-stream';

    // レスポンスヘッダーを設定
    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Cache-Control', 'public, max-age=86400'); // 1日キャッシュ
    headers.set('Content-Length', stats.size.toString());

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
