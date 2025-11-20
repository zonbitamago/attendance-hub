'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * 使い方ガイドの各セクション
 */
interface GuideSection {
  id: string;
  title: string;
  description: string;
  steps: {
    title: string;
    description: string;
    image?: string;
    imageAlt?: string;
  }[];
}

const guideSections: GuideSection[] = [
  {
    id: 'introduction',
    title: 'はじめに',
    description: 'Attendance Hubは、吹奏楽団や合唱団などの団体の出欠管理を簡単に行えるWebアプリケーションです。',
    steps: [
      {
        title: 'Attendance Hubとは',
        description: '練習日や演奏会などのイベントごとに、メンバーの出欠状況を管理できます。グループ（パート）別の管理や、複数イベントへの一括登録など、便利な機能を備えています。',
      },
    ],
  },
  {
    id: 'create-org',
    title: '1. 団体を作成する',
    description: 'まずは団体を作成しましょう。',
    steps: [
      {
        title: '団体情報を入力',
        description: 'トップページで団体名と説明を入力し、「団体を作成」ボタンをクリックします。',
        image: '/images/guide/01-create-org-initial.png',
        imageAlt: '団体作成画面の初期表示',
      },
      {
        title: 'URLを共有',
        description: '団体が作成されると、専用のURLが発行されます。このURLをメンバーに共有して、出欠登録してもらいましょう。',
        image: '/images/guide/01-create-org-filled.png',
        imageAlt: '団体作成フォーム入力中',
      },
    ],
  },
  {
    id: 'group-management',
    title: '2. グループを設定する',
    description: 'パートやチームなどのグループを作成し、メンバーを登録します。',
    steps: [
      {
        title: 'グループ管理画面を開く',
        description: '管理画面から「グループ管理」を選択します。',
        image: '/images/guide/04-group-management.png',
        imageAlt: 'グループ管理画面',
      },
      {
        title: 'グループを作成',
        description: 'グループ名を入力し、「追加」ボタンをクリックします。色を設定して視覚的に区別することもできます。',
        image: '/images/guide/04-group-create-form.png',
        imageAlt: 'グループ作成フォーム',
      },
      {
        title: 'メンバーを追加',
        description: '各グループにメンバーを追加します。名前を入力して「追加」ボタンをクリックするだけです。',
      },
    ],
  },
  {
    id: 'event-management',
    title: '3. イベントを登録する',
    description: '練習日や演奏会などのイベントを登録します。',
    steps: [
      {
        title: 'イベント管理画面を開く',
        description: '管理画面から「イベント管理」を選択します。',
        image: '/images/guide/05-event-management.png',
        imageAlt: 'イベント管理画面',
      },
      {
        title: 'イベントを作成',
        description: 'タイトル、日付、場所などを入力して「追加」ボタンをクリックします。',
        image: '/images/guide/05-event-create-form.png',
        imageAlt: 'イベント作成フォーム',
      },
    ],
  },
  {
    id: 'attendance-register',
    title: '4. 出欠を登録する',
    description: 'メンバーは各イベントに対して出欠を登録できます。',
    steps: [
      {
        title: 'イベントを選択',
        description: 'トップページのイベント一覧から、出欠を登録したいイベントを選択します。',
        image: '/images/guide/02-org-top-with-events.png',
        imageAlt: 'イベント一覧',
      },
      {
        title: '出欠登録画面を開く',
        description: 'イベント詳細ページで「出欠を登録する」ボタンをクリックします。',
        image: '/images/guide/08-attendance-register-initial.png',
        imageAlt: '出欠登録画面の初期表示',
      },
      {
        title: 'グループとメンバーを選択',
        description: '自分が所属するグループを選択し、名前を選びます。',
        image: '/images/guide/08-attendance-register-group-selected.png',
        imageAlt: 'グループ選択後の画面',
      },
      {
        title: 'ステータスを選択',
        description: '「◯（参加）」「△（未定）」「✗（欠席）」のいずれかを選択します。',
        image: '/images/guide/08-attendance-register-status-selected.png',
        imageAlt: 'ステータス選択中',
      },
    ],
  },
  {
    id: 'bulk-register',
    title: '5. 一括登録を活用する',
    description: '複数のイベントに対して、まとめて出欠を登録できます。',
    steps: [
      {
        title: '一括登録画面を開く',
        description: 'トップページから「一括出欠登録」を選択します。',
        image: '/images/guide/09-bulk-register-initial.png',
        imageAlt: '一括登録画面の初期表示',
      },
      {
        title: 'メンバーを選択',
        description: '自分の名前を選択します。',
        image: '/images/guide/09-bulk-register-member-selected.png',
        imageAlt: 'メンバー選択後の画面',
      },
      {
        title: '各イベントの出欠を設定',
        description: '表示されるイベント一覧で、それぞれの出欠ステータスを選択します。',
        image: '/images/guide/09-bulk-register-event-selected.png',
        imageAlt: 'イベント選択中の画面',
      },
      {
        title: '一括登録',
        description: '設定が完了したら「登録」ボタンをクリックして、まとめて登録します。',
      },
    ],
  },
  {
    id: 'check-attendance',
    title: '6. 出欠状況を確認する',
    description: 'イベント詳細画面で、メンバーの出欠状況を確認できます。',
    steps: [
      {
        title: 'イベント詳細を開く',
        description: 'イベント一覧から確認したいイベントを選択します。',
        image: '/images/guide/07-event-detail.png',
        imageAlt: 'イベント詳細画面',
      },
      {
        title: 'グループ別に確認',
        description: 'グループ名をクリックすると、そのグループのメンバー一覧が展開されます。',
        image: '/images/guide/07-event-detail-expanded.png',
        imageAlt: 'アコーディオン展開時',
      },
      {
        title: 'フィルタ・検索',
        description: 'ステータスでフィルタしたり、名前で検索することもできます。',
        image: '/images/guide/07-event-detail-filter.png',
        imageAlt: 'フィルタ機能使用中',
      },
    ],
  },
  {
    id: 'org-settings',
    title: '7. 団体を管理する',
    description: '団体名の変更や削除ができます。',
    steps: [
      {
        title: '団体設定を開く',
        description: '管理画面から「団体設定」を選択します。',
        image: '/images/guide/06-org-settings.png',
        imageAlt: '団体設定画面',
      },
      {
        title: '団体情報を編集',
        description: '団体名や説明を変更できます。',
      },
      {
        title: '団体を削除',
        description: '「団体を削除」ボタンから、団体を完全に削除できます。この操作は取り消せませんのでご注意ください。',
      },
    ],
  },
];

export default function PublicGuidePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ナビゲーション */}
        <nav className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800"
          >
            ← トップページに戻る
          </Link>
        </nav>

        {/* ヘッダー */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            使い方ガイド
          </h1>
          <p className="text-gray-600">
            Attendance Hubの基本的な使い方を説明します。
          </p>
        </header>

        {/* 目次 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">目次</h2>
          <nav>
            <ul className="space-y-2">
              {guideSections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* セクション */}
        <div className="space-y-12">
          {guideSections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {section.title}
              </h2>
              <p className="text-gray-600 mb-6">{section.description}</p>

              <div className="space-y-8">
                {section.steps.map((step, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    {step.image && (
                      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={step.image}
                          alt={step.imageAlt || step.title}
                          width={800}
                          height={450}
                          className="w-full h-auto"
                          priority={index === 0}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* フッター */}
        <footer className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-4">
            ご不明な点がございましたら、管理者にお問い合わせください。
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            団体を作成する
          </Link>
        </footer>
      </div>
    </main>
  );
}
