#!/bin/bash

echo "==================================="
echo "Serena MCP セットアップスクリプト"
echo "==================================="
echo ""

# 1. uvのインストール確認
echo "📦 Step 1: uvのインストール確認..."
if ! command -v uv &> /dev/null; then
    echo "uvがインストールされていません。インストールします..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
    echo "✅ uvのインストール完了"
else
    echo "✅ uvは既にインストールされています"
fi

echo ""

# 2. Claude Codeのインストール確認
echo "🤖 Step 2: Claude Codeの確認..."
if ! command -v claude &> /dev/null; then
    echo "⚠️  Claude Codeがインストールされていません"
    echo "以下のURLからインストールしてください:"
    echo "https://docs.claude.com/en/docs/claude-code"
    exit 1
else
    echo "✅ Claude Codeがインストールされています"
fi

echo ""

# 3. Serena MCPの追加
echo "🚀 Step 3: Serena MCPをClaude Codeに追加..."
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"

if [ $? -eq 0 ]; then
    echo "✅ Serena MCPの追加完了!"
    echo ""
    echo "🎉 セットアップ完了!"
    echo ""
    echo "次のステップ:"
    echo "1. Claude Codeを起動: claude"
    echo "2. ダッシュボードが自動的に開きます: http://localhost:24282/dashboard/index.html"
    echo "3. 初回は「Onboarding」プロセスが実行されます"
    echo "4. プロジェクトのコードを分析する質問をしてみましょう!"
    echo "   例: 'Analyze my React codebase in ./src'"
else
    echo "❌ エラーが発生しました"
    exit 1
fi
