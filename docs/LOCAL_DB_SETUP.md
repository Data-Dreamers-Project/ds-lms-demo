# 開発環境用DB構築手順

このドキュメントでは、ローカル開発用の PostgreSQL + Prisma のセットアップ手順を説明します。

## 前提条件

- Docker / Docker Desktop がインストールされていること
- このリポジトリの依存関係がインストール済みであること
  - `bun install`

## 1. 環境変数の設定

1. ルートディレクトリで `.env.example` をコピーして `.env` を作成します。

   ```bash
   cp .env.example .env
   ```

2. `.env` 内の `DATABASE_URL` / `DIRECT_URL` を確認・必要に応じて編集します。

   デフォルトでは、以下のようにローカルの Postgres を前提にしています。

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ds-lms-demo?schema=public"
   DIRECT_URL="postgresql://postgres:postgres@localhost:5432/ds-lms-demo?schema=public"
   ```

## 2. Docker で PostgreSQL を起動

プロジェクトルートにある `docker-compose.yml` から、Postgres コンテナを起動します。

```bash
bun run db:up
```

これにより、以下の設定でコンテナが立ち上がります。

- イメージ: `postgres:17`
- ホストポート: `5432`
- ユーザー名: `postgres`
- パスワード: `postgres`
- データベース名: `ds-lms-demo`

停止したい場合は、次のコマンドを実行します。

```bash
bun run db:down
```

## 3. Prisma マイグレーションの適用

DB スキーマを最新状態にするため、Prisma のマイグレーションを適用します。

```bash
bun run db:migrate
```

内部的には `prisma migrate dev` が実行され、`prisma/migrations` の内容が DB に反映されます。

## 4. 初期データ（Seeder）の実行

バックアップ用の SQL（`prisma/seeder/seed.sql`）をそのまま流し込むため、Seeder を実行します。

```bash
bun run db:seed
```

- 内部的には、次のコマンドが呼ばれます。
  - `docker compose exec -T db psql -U postgres -d ds-lms-demo -f /seeder/seed.sql`

### Seeder の前提条件

- ローカル環境に Docker / Docker Compose がインストールされていること
- `bun run db:up` で `db` サービス（Postgresコンテナ）が起動していること
- 既存データはバックアップ内容で上書きされる可能性があります

バックアップSQLファイルのパス:

- ホスト側: `prisma/seeder/seed.sql`
- コンテナ内: `/seeder/seed.sql`

## 5. アプリケーションの起動

DB が立ち上がり、マイグレーションと Seeder が完了したら、アプリケーションを起動します。

```bash
bun run dev
```

ブラウザで `http://localhost:3000` を開き、画面から動作を確認してください。

## よくあるトラブルシュート

- **ポート 5432 が既に使用されている**
  - 既に別の PostgreSQL やコンテナが動いていないか確認してください。
  - 競合しているプロセスを停止するか、`docker-compose.yml` のポートを変更してください。
- **`db:seed` 実行時に接続エラーになる**
  - `bun run db:up` でコンテナが起動しているか確認してください。
  - `.env` の `DATABASE_URL` / `DIRECT_URL` が正しいか確認してください。
