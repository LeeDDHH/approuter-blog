import { useMemo } from "react";

/**
 * ISO 8601形式の日時から「何日前・何時間前・何分前」かを返すhooks
 * @param isoDate ISO 8601形式の日時文字列
 * @returns 何日前・何時間前・何分前かの文字列
 */
export function useDaysAgo(isoDate: string): string {
  return useMemo(() => {
    const now = new Date();
    const target = new Date(isoDate);
    const diffMs = now.getTime() - target.getTime();
    const msPerMinute = 1000 * 60;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;

    if (diffMs < msPerHour) {
      // 1時間未満
      const minutes = Math.max(1, Math.floor(diffMs / msPerMinute));
      return `${minutes}分前`;
    } else if (diffMs < msPerDay) {
      // 1日未満
      const hours = Math.floor(diffMs / msPerHour);
      return `${hours}時間前`;
    } else {
      // 1日以上
      const days = Math.floor(diffMs / msPerDay);
      return `${days}日前`;
    }
  }, [isoDate]);
}