# Phase 12: GitHub Actions CIの追加

## 1. 概要

GitHubリポジトリへのプッシュやPull Request作成時に、コードの品質チェック（Lint、Formatチェック）とビルド、テストを自動実行する継続的インテグレーション（CI）環境を構築します。

## 2. ワークフロー仕様

- **発火条件**:
  - `main` ブランチへの `push`
  - `main` ブランチ向けの `pull_request`
- **環境**:
  - `ubuntu-latest`
  - Node.js (バージョンは現行プロジェクトに合わせた LTS、例: v22系)
- **実行ステップ**:
  1. リポジトリのチェックアウト
  2. Node.js のセットアップ
  3. 依存関係のインストール (`npm ci`)
  4. Lint / Format / 型チェックの実行 (`npm run lint`)
  5. ユニットテストの実行 (`npm run test`)
  6. プロジェクトのビルド (`npm run build`)
     - ※ビルド時に環境変数 `DATABASE_URL` を要求される可能性を考慮し、ダミーのURLをセットします。

## 3. 作成ファイル

- **`.github/workflows/ci.yml`**: 上記のプロセスを実行する GitHub Actions の設定ファイル。

## 4. 自動化によるメリット

- コードフォーマットの乱れや型エラー、Linterエラーの混入を防ぐことができます。
- デプロイ前にビルドが通ることを保証できます。
