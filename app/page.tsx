'use client'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          グループ一覧
        </h2>
        <p className="text-gray-600 mb-6">
          グループを作成して、出欠確認を始めましょう。
        </p>

        <div className="flex justify-center items-center min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500 mb-4">まだグループがありません</p>
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              + 新しいグループを作成
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
