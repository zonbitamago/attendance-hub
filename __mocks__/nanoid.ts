// Jest用のnanoidモック

let counter = 0;

export const nanoid = (length: number = 21): string => {
  // テスト用の決定的なIDを生成（実際のランダム性は不要）
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  counter++;

  // counterを基にIDを生成
  const base = `test${counter.toString().padStart(4, '0')}`;

  // 指定された長さになるまでパディング
  return (base + chars.repeat(Math.ceil(length / chars.length)))
    .substring(0, length);
};
