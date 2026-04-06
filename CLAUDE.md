# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Data Dreamers が開発した Data Science 初学者向け学習支援システム（LMS）および内部向け管理ツール。Next.js フルスタックアプリケーション。

## Commands

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# リント（Biome）
npm run lint

# テスト実行（Jest）
npm run test

# 単一テストファイルを実行
npx jest <file-path>

# Storybook 起動
npm run storybook

# ローカルDB起動
npm run db:up
npm run db:down

# DBマイグレーション
npm run db:migrate

# DBシード（Docker起動後）
npm run db:seed
```

## Architecture

### ルーティング・ページ構成

**Next.js App Router** を使用。ページとAPIが `src/app/` に共存する。

- `src/app/(pages)/` — ユーザー向けページ（`students/`, `manage/`, `auth/`, `profile/` 等）
- `src/app/api/[[...route]]/` — **Hono** による RESTful API（catch-all ルーティング）
- `src/middleware.ts` — NextAuth 認証 + Vercel Edge Config によるメンテナンスモード・ロール保護

### API レイヤー（Hono + Next.js）

APIは **Hono** フレームワークで構築され、`src/lib/hono.ts` でルーターを初期化し、`src/app/api/[[...route]]/route.ts` でマウントしている。各エンドポイントは `src/app/api/[[...route]]/` 以下のサブディレクトリに分割。

パスエイリアス `~/*` は `src/app/api/[[...route]]/*` を指す（API内部参照用）。

### フィーチャー構造

ビジネスロジック・コンポーネントは **`src/features/`** に機能別に分割されている。ページコンポーネントは薄く保ち、フィーチャーが実装を担う。

```
src/features/
  courses/     # コース管理
  problems/    # 問題・解答
  dashboard/   # ダッシュボード
  manage/      # 管理ツール
  profile/     # プロフィール
```

### 認証

**NextAuth v4** + **Azure AD B2C** で認証を管理。セッション情報は Prisma（PostgreSQL）で永続化。`src/lib/auth.ts` に設定。ロールは `SystemRole`（ADMIN / USER）で制御。

### データベース

**Prisma ORM** + **PostgreSQL**。ローカル開発は Docker Compose でDBを起動。`prisma/schema.prisma` がスキーマの唯一の真実源。

### ファイルストレージ

**Supabase Storage** を使用（`src/lib/supabase.ts`）。

### UIコンポーネント

**shadcn/ui**（Radix UI ベース）+ **Tailwind CSS v4**。コンポーネントは `src/components/ui/` に配置。新規追加は `npx shadcn@latest add <component>`。

## Path Aliases

| エイリアス | 解決先 |
|-----------|--------|
| `@/*` | `src/*` |
| `~/*` | `src/app/api/[[...route]]/*` |

## Code Style

- **Biome** でリント・フォーマット（タブインデント、ダブルクォート、行幅120文字）
- **pre-commit フック**（lefthook）でBiome・Prismaフォーマットが自動実行
- `src/lib/env.ts` で環境変数を一元管理（`@t3-oss/env-nextjs`）。環境変数は必ずここ経由でアクセス

## Local Development Setup

1. `.env.example` を `.env.local` にコピーして環境変数を設定
2. `npm run db:up` でPostgresを起動
3. `npm run db:migrate` でマイグレーション実行
4. `npm run db:seed` でシードデータ投入
5. `npm run dev` で開発サーバー起動

詳細は `docs/LOCAL_DB_SETUP.md` を参照。

## Branch Naming

```
feature/{issue-number}
fix/{issue-number}
refactor/{issue-number}
```