import { useEffect, useRef } from 'react';
import {
  QueryFunction,
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

type CronRulePart = { type: 'any' } | { type: 'specific'; value: number };

interface ParsedCronRules {
  minute: CronRulePart;
  hour: CronRulePart;
  dayOfMonth: CronRulePart;
  month: CronRulePart; 
  dayOfWeek: CronRulePart;
}

/**
 * 단일 cron 필드 부분을 파싱합니다 (예: "5" 또는 "*").
 * @param part 파싱할 문자열 부분
 * @param min 허용 최소값
 * @param max 허용 최대값
 * @returns 파싱된 룰 객체 또는 null (에러 시)
 */
function parseCronPart(part: string, min: number, max: number): CronRulePart | null {
  if (part === '*') {
    return { type: 'any' };
  }
  const value = parseInt(part, 10);
  if (isNaN(value) || value < min || value > max) {
    console.error(`[SimpleCronParser] Invalid cron part value: "${part}" for range ${min}-${max}`);
    return null;
  }
  return { type: 'specific', value };
}

/**
 * 단순화된 cron 표현식을 파싱합니다.
 * @param expression 5부분으로 구성된 cron 문자열 (예: "* * * * *")
 * @returns 파싱된 룰 객체 또는 null (에러 시)
 */
function parseSimpleCron(expression: string): ParsedCronRules | null {
  console.warn(
    '[useCronQuery] Using a simplified internal cron parser. For complex schedules or production, consider a dedicated library like "cron-parser".'
  );
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    console.error(`[SimpleCronParser] Invalid cron expression: "${expression}". Expected 5 parts.`);
    return null;
  }

  const minuteRule = parseCronPart(parts[0], 0, 59);
  const hourRule = parseCronPart(parts[1], 0, 23);
  const dayOfMonthRule = parseCronPart(parts[2], 1, 31);
  const monthRule = parseCronPart(parts[3], 1, 12);
  const dayOfWeekRule = parseCronPart(parts[4], 0, 6); 

  if (!minuteRule || !hourRule || !dayOfMonthRule || !monthRule || !dayOfWeekRule) {
    return null;
  }

  return {
    minute: minuteRule,
    hour: hourRule,
    dayOfMonth: dayOfMonthRule,
    month: monthRule,
    dayOfWeek: dayOfWeekRule,
  };
}

/**
 * 주어진 날짜가 파싱된 cron 규칙과 일치하는지 확인합니다.
 * @param date 확인할 날짜 객체
 * @param rules 파싱된 cron 규칙
 * @returns 일치하면 true, 아니면 false
 */
function dateMatchesRules(date: Date, rules: ParsedCronRules): boolean {
  if (rules.minute.type === 'specific' && date.getMinutes() !== rules.minute.value) return false;
  if (rules.hour.type === 'specific' && date.getHours() !== rules.hour.value) return false;
  if (rules.month.type === 'specific' && (date.getMonth() + 1) !== rules.month.value) return false;

  const dayOfMonthMatches =
    rules.dayOfMonth.type === 'any' ||
    date.getDate() === (rules.dayOfMonth).value;

  const dayOfWeekMatches =
    rules.dayOfWeek.type === 'any' ||
    date.getDay() === (rules.dayOfWeek).value;

  // 일(dayOfMonth)과 요일(dayOfWeek) 규칙 처리:
  // 둘 다 '*'이면 항상 통과 (위에서 이미 처리됨)
  // 하나만 '*'이면, 특정 값으로 지정된 규칙만 확인
  // 둘 다 특정 값이면, 둘 다 만족해야 함
  if (rules.dayOfMonth.type === 'specific' && rules.dayOfWeek.type === 'specific') {
    if (!dayOfMonthMatches || !dayOfWeekMatches) return false;
  } else if (rules.dayOfMonth.type === 'specific') {
    if (!dayOfMonthMatches) return false;
  } else if (rules.dayOfWeek.type === 'specific') {
    if (!dayOfWeekMatches) return false;
  }

  return true;
}

/**
 * 파싱된 cron 규칙에 따라 다음 실행 시간을 계산합니다 (1분 단위로 순차 검색).
 * @param rules 파싱된 cron 규칙
 * @param startDate 검색 시작 기준 날짜
 * @returns 다음 실행 시간 Date 객체 또는 null (계산 실패 또는 너무 먼 미래)
 */
function calculateNextExecutionTimeSimple(
  rules: ParsedCronRules,
  startDate: Date
): Date | null {
  // 현재 시간보다 1분 뒤부터 검색 시작 (초와 밀리초는 0으로 설정)
  let candidateDate = new Date(startDate.getTime());
  candidateDate.setSeconds(0, 0);
  candidateDate.setMinutes(candidateDate.getMinutes() + 1);

  // 무한 루프 방지를 위한 최대 탐색 제한 (예: 5년 후까지)
  const maxDate = new Date(startDate);
  maxDate.setFullYear(startDate.getFullYear() + 5); // 5년 후
  const maxIterations = 5 * 365 * 24 * 60; // 대략 5년치 분 단위 반복 횟수

  for (let i = 0; i < maxIterations; i++) {
    if (candidateDate.getTime() > maxDate.getTime()) {
      console.error('[SimpleCronCalculator] Next execution time is beyond 5 years.');
      return null;
    }

    if (dateMatchesRules(candidateDate, rules)) {
      return candidateDate;
    }
    candidateDate.setMinutes(candidateDate.getMinutes() + 1); // 다음 1분으로 이동
  }

  console.error('[SimpleCronCalculator] Could not find next execution time within iteration limit.');
  return null;
}


export interface CronOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'queryKey' | 'queryFn' | 'refetchInterval' | 'refetchOnWindowFocus' | 'refetchOnMount'
  > {
  queryKey: TQueryKey;
  queryFn: QueryFunction<TQueryFnData, TQueryKey>;
  cronExpression: string;
  cronEnabled?: boolean;
}

export default function useCronQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>({
  queryKey,
  queryFn,
  cronExpression,
  cronEnabled = true,
  ...queryOptions
}: CronOptions<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<TData, TError> {
  const queryResult = useQuery<TQueryFnData, TError, TData, TQueryKey>({
    queryKey,
    queryFn,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...queryOptions,
  });

  const { refetch } = queryResult;
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const parsedRulesRef = useRef<ParsedCronRules | null>(null);

  useEffect(() => {
    if (cronExpression) {
      parsedRulesRef.current = parseSimpleCron(cronExpression);
      if (!parsedRulesRef.current) {
        console.error(`[useCronQuery] Failed to parse cron expression: "${cronExpression}". Cron scheduling will be disabled.`);
      }
    } else {
      parsedRulesRef.current = null;
    }
  }, [cronExpression]);


  useEffect(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    if (!cronEnabled || !parsedRulesRef.current) {
      return;
    }

    const rules = parsedRulesRef.current;

    const scheduleNextRefetch = (now: Date) => {
      const nextExecutionTime = calculateNextExecutionTimeSimple(rules, now);

      if (nextExecutionTime) {
        const delay = nextExecutionTime.getTime() - now.getTime();
        if (delay < 0) {
            console.warn('[useCronQuery] Calculated next execution time is in the past. Scheduling immediately.');
            refetch();
            scheduleNextRefetch(new Date());
            return;
        }

        console.log(
          `[useCronQuery] Scheduling refetch for queryKey "${String(queryKey)}" at ${nextExecutionTime.toISOString()} (in ${delay}ms)`
        );

        timeoutIdRef.current = setTimeout(() => {
          console.log(
            `[useCronQuery] Refetching queryKey "${String(queryKey)}" as per custom cron schedule.`
          );
          refetch();
          scheduleNextRefetch(new Date());
        }, delay);
      } else {
        console.error(
          `[useCronQuery] Could not schedule next refetch for queryKey "${String(queryKey)}" with expression "${cronExpression}". Cron task might stop.`
        );
      }
    };

    scheduleNextRefetch(new Date());

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
        console.log(`[useCronQuery] Cleared scheduled refetch for queryKey "${String(queryKey)}"`);
      }
    };
  }, [cronEnabled, refetch, queryKey, cronExpression]);

  return queryResult;
}