import { useEffect, useRef } from 'react';
import { QueryFunction, QueryKey, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

type CronRulePart = { type: 'any' } | { type: 'specific'; value: number };

interface ParsedCronRules {
  minute: CronRulePart;
  hour: CronRulePart;
  dayOfMonth: CronRulePart;
  month: CronRulePart;
  dayOfWeek: CronRulePart;
}

/**
 * Parses a single cron field part (e.g., "5" or "*").
 * @param part The string part to parse
 * @param min The minimum allowed value
 * @param max The maximum allowed value
 * @returns The parsed rule object, or null if an error occurs
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
 * Parses a simplified cron expression.
 * @param expression A cron string consisting of 5 parts (e.g., "* * * * *")
 * @returns The parsed rule object, or null if an error occurs
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
 * Checks whether the given date matches the parsed cron rules.
 * @param date The Date object to check
 * @param rules Parsed cron rules
 * @returns true if it matches, false otherwise
 */
function dateMatchesRules(date: Date, rules: ParsedCronRules): boolean {
  if (rules.minute.type === 'specific' && date.getMinutes() !== rules.minute.value) return false;
  if (rules.hour.type === 'specific' && date.getHours() !== rules.hour.value) return false;
  if (rules.month.type === 'specific' && date.getMonth() + 1 !== rules.month.value) return false;

  const dayOfMonthMatches = rules.dayOfMonth.type === 'any' || date.getDate() === rules.dayOfMonth.value;
  const dayOfWeekMatches = rules.dayOfWeek.type === 'any' || date.getDay() === rules.dayOfWeek.value;

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
 * Calculates the next execution time based on the parsed cron rules (searches sequentially in 1-minute increments).
 * @param rules Parsed cron rules
 * @param startDate The starting date from which to begin the search
 * @returns The next execution time as a Date object, or null if the calculation fails or the next time is too far in the future
 */
function calculateNextExecutionTimeSimple(rules: ParsedCronRules, startDate: Date): Date | null {
  let candidateDate = new Date(startDate.getTime());
  candidateDate.setSeconds(0, 0);
  candidateDate.setMinutes(candidateDate.getMinutes() + 1);

  const maxDate = new Date(startDate);
  maxDate.setFullYear(startDate.getFullYear() + 5);
  const maxIterations = 5 * 365 * 24 * 60;

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
        console.error(
          `[useCronQuery] Failed to parse cron expression: "${cronExpression}". Cron scheduling will be disabled.`
        );
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
          console.log(`[useCronQuery] Refetching queryKey "${String(queryKey)}" as per custom cron schedule.`);
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
