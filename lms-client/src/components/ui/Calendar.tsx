import { Button } from './Button';
import { cn } from '../../lib/utils';
import { List, Grid3X3, CalendarDays, ChevronRight } from 'lucide-react';
import { cva } from 'class-variance-authority';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInMinutes,
  format,
  isSameDay,
  isSameHour,
  isSameMonth,
  isToday,
  setHours,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import type { Locale } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import {
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useIsMobile } from '../../hooks/use-mobile';

const monthEventVariants = cva('size-2 rounded-full', {
  variants: {
    variant: {
      default: 'bg-primary',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      pink: 'bg-pink-500',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const dayEventVariants = cva('font-bold border-l-4 rounded p-2 text-xs', {
  variants: {
    variant: {
      default: 'bg-muted/30 text-muted-foreground border-muted',
      blue: 'bg-blue-500/30 text-blue-600 border-blue-500',
      green: 'bg-green-500/30 text-green-600 border-green-500',
      pink: 'bg-pink-500/30 text-pink-600 border-pink-500',
      purple: 'bg-purple-500/30 text-purple-600 border-purple-500',
      indigo: 'bg-indigo-500/30 text-indigo-600 border-indigo-500',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type CalendarView = 'day' | 'week' | 'month' | 'year';

type ContextType = {
  view: CalendarView;
  setView: (view: CalendarView) => void;
  date: Date;
  setDate: (date: Date) => void;
  events: EventType[];
  locale: Locale;
  setEvents: (events: EventType[]) => void;
  onChangeView?: (view: CalendarView) => void;
  onEventClick?: (event: EventType) => void;
  enableHotkeys?: boolean;
  today: Date;
  onEmptyDateClick?: (date: Date) => void;
};

const Context = createContext<ContextType>({} as ContextType);

export interface EventType {
  id: string;
  start: Date;
  end: Date;
  name: string;
  color?: 'default' | 'blue' | 'green' | 'pink' | 'purple' | 'indigo';
  description?: string;
  className?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isCancelled?: boolean;
  isUpcoming?: boolean;
}

type CalendarProps = {
  children: ReactNode;
  defaultDate?: Date;
  events?: EventType[];
  view?: CalendarView;
  locale?: Locale;
  enableHotkeys?: boolean;
  onChangeView?: (view: CalendarView) => void;
  onEventClick?: (event: EventType) => void;
  onEmptyDateClick?: (date: Date) => void;
  header?: ReactNode;
};

export const Calendar = ({
  children,
  defaultDate = new Date(),
  locale = enUS,
  enableHotkeys = true,
  view: _defaultMode = 'month',
  onEventClick,
  events: defaultEvents = [],
  onChangeView,
  onEmptyDateClick,
  header,
}: CalendarProps) => {
  const [view, setView] = useState<CalendarView>(_defaultMode);
  const [date, setDate] = useState<Date>(defaultDate || new Date());
  const [events, setEvents] = useState<EventType[]>(defaultEvents);
  const isMobile = useIsMobile();

  useEffect(() => {
    setEvents(defaultEvents);
  }, [defaultEvents]);

  useEffect(() => {
    if (_defaultMode && _defaultMode !== view) {
      setView(_defaultMode);
    }
  }, [_defaultMode, view]);

  useEffect(() => {
    if (defaultDate && defaultDate.getTime() !== date.getTime()) {
      setDate(defaultDate);
    }
  }, [defaultDate]);

  useEffect(() => {
    if (isMobile && view !== 'day') {
      setView('day');
      onChangeView?.('day');
    }
  }, [isMobile, view, onChangeView]);

  const changeView = (view: CalendarView) => {
    setView(view);
    onChangeView?.(view);
  };

  useHotkeys('m', () => changeView('month'), {
    enabled: enableHotkeys,
  });
  useHotkeys('w', () => changeView('week'), {
    enabled: enableHotkeys,
  });
  useHotkeys('d', () => changeView('day'), {
    enabled: enableHotkeys,
  });

  const safeDate = date || new Date();

  return (
    <Context.Provider
      value={{
        view,
        setView,
        date: safeDate,
        setDate,
        events,
        setEvents,
        locale,
        enableHotkeys,
        onEventClick,
        onChangeView,
        today: new Date(),
        onEmptyDateClick,
      }}
    >
      {header}
      <div className="max-h-[100dvhs] w-full overflow-x-auto">
        <div
          className={cn(
            'h-full',
            view === 'day' ? 'min-w-full' : 'min-w-[600px] md:min-w-[1000px]'
          )}
        >
          {children}
        </div>
      </div>
    </Context.Provider>
  );
};

export const useCalendar = () => useContext(Context);

export const CalendarViewSelect = () => {
  const { view, setView, onChangeView } = useCalendar();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const views = [
    { value: 'day', label: 'Day', icon: List },
    { value: 'week', label: 'Week', icon: Grid3X3 },
    { value: 'month', label: 'Month', icon: CalendarDays },
  ];

  const currentView = views.find(v => v.value === view);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const tid = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('touchstart', handleClickOutside, true);
    }, 0);

    return () => {
      clearTimeout(tid);
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [isOpen]);

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
    onChangeView?.(newView);
  };

  return (
    <div className="relative">
      <div className="bg-muted/50 hidden rounded-lg border p-1 sm:flex">
        {views.map(v => {
          const Icon = v.icon;
          return (
            <button
              key={v.value}
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleViewChange(v.value as CalendarView);
              }}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all cursor-pointer',
                view === v.value
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sm:hidden">
        <button
          ref={triggerRef}
          type="button"
          onClick={e => {
            e.stopPropagation();
            setIsOpen(prev => !prev);
          }}
          className="bg-background hover:bg-accent flex min-w-[120px] items-center justify-between gap-2 rounded-lg border px-3 py-2 transition-colors"
        >
          {currentView && (
            <>
              <currentView.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{currentView.label}</span>
            </>
          )}
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-90'
            )}
          />
        </button>
        {isOpen && (
          <div
            ref={dropdownRef}
            className="bg-popover absolute right-0 z-50 mt-2 w-48 rounded-lg border p-1 shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            {views.map(v => {
              const Icon = v.icon;
              return (
                <button
                  key={v.value}
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleViewChange(v.value as CalendarView);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    view === v.value
                      ? 'bg-accent font-medium'
                      : 'hover:bg-accent/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const EventGroup = ({ events, hour }: { events: EventType[]; hour: Date }) => {
  const { onEventClick } = useCalendar();
  return (
    <div className="h-20 border-t last:border-b">
      {events
        .filter(event => isSameHour(event.start, hour))
        .map(event => {
          const hoursDifference =
            differenceInMinutes(event.end, event.start) / 60;
          const startPosition = event.start.getMinutes() / 60;
          return (
            <div
              key={event.id}
              data-event
              className={cn(
                'relative cursor-pointer',
                dayEventVariants({ variant: event.color })
              )}
              style={{
                top: `${startPosition * 100}%`,
                height: `${hoursDifference * 100}%`,
              }}
              onClick={() => onEventClick?.(event)}
            >
              {event.name}
            </div>
          );
        })}
    </div>
  );
};

export const CalendarDayView = () => {
  const { view, events, date, onEmptyDateClick } = useCalendar();
  const isMobile = useIsMobile();

  const VISIBLE_START = isMobile ? 5 : 0;
  const VISIBLE_END = isMobile ? 22 : 23;
  const VISIBLE_COUNT = VISIBLE_END - VISIBLE_START + 1;

  if (view !== 'day') return null;

  if (!date) return null;

  const hours = [...Array(24)]
    .map((_, i) => setHours(date, i))
    .filter(h => {
      const hr = h.getHours();
      return hr >= VISIBLE_START && hr <= VISIBLE_END;
    });

  const now = new Date();
  const isTodayView = isToday(date);
  const nowHour = now.getHours();
  const nowMinutes = now.getMinutes();
  const showNowLine =
    now.toDateString() === date.toDateString() &&
    nowHour >= VISIBLE_START &&
    nowHour <= VISIBLE_END;

  const nowTop =
    ((nowHour - VISIBLE_START + nowMinutes / 60) / VISIBLE_COUNT) * 100;

  return (
    <div className="relative flex h-full min-w-full overflow-x-auto overflow-y-auto pt-2 sm:min-w-[600px]">
      <TimeTable
        visibleStartHour={VISIBLE_START}
        visibleEndHour={VISIBLE_END}
      />
      <div className="relative flex-1">
        {isTodayView && showNowLine && (
          <div
            className="pointer-events-none absolute right-0 left-0 z-50 h-[2px] bg-red-500"
            style={{ top: `calc(${nowTop}% - 1px)` }}
          >
            <div className="absolute top-1/2 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500"></div>
          </div>
        )}
        {hours.map(hour => (
          <div
            key={hour.toString()}
            className="h-20 cursor-pointer border-t last:border-b"
            onClick={e => {
              if ((e.target as HTMLElement).closest('[data-event]')) return;
              onEmptyDateClick?.(hour);
            }}
          >
            <EventGroup hour={hour} events={events} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CalendarWeekView = () => {
  const { view, date, locale, events, onEmptyDateClick } = useCalendar();
  const isMobile = useIsMobile();

  const VISIBLE_START = isMobile ? 5 : 0;
  const VISIBLE_END = isMobile ? 22 : 23;

  const weekDates = useMemo(() => {
    if (!date || view !== 'week') return [];
    const start = startOfWeek(date, { weekStartsOn: 0 });
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(start, i);
      const hours = [...Array(24)]
        .map((_, i) => setHours(day, i))
        .filter(h => {
          const hr = h.getHours();
          return hr >= VISIBLE_START && hr <= VISIBLE_END;
        });
      weekDates.push(hours);
    }
    return weekDates;
  }, [date, view, VISIBLE_START, VISIBLE_END]);

  const headerDays = useMemo(() => {
    if (!date || view !== 'week') return [];
    const daysOfWeek = [];
    for (let i = 0; i < 7; i++) {
      const result = addDays(startOfWeek(date, { weekStartsOn: 0 }), i);
      daysOfWeek.push(result);
    }
    return daysOfWeek;
  }, [date, view]);

  if (view !== 'week') return null;

  if (!date) return null;

  const VISIBLE_COUNT = VISIBLE_END - VISIBLE_START + 1;

  const now = new Date();
  const isCurrentWeek =
    weekDates.length > 0 &&
    weekDates.some(hours => hours.length > 0 && isSameDay(hours[0], now));
  const nowHour = now.getHours();
  const nowMinutes = now.getMinutes();
  const showNowLine = nowHour >= VISIBLE_START && nowHour <= VISIBLE_END;

  const nowTop =
    ((nowHour - VISIBLE_START + nowMinutes / 60) / VISIBLE_COUNT) * 100;

  return (
    <div className="relative flex h-full min-w-full flex-col overflow-x-auto overflow-y-auto sm:min-w-[900px]">
      <div className="bg-card sticky top-0 z-10 mb-3 flex min-w-full border-b sm:min-w-[900px]">
        <div className="w-12"></div>
        {headerDays.map((date, i) => (
          <div
            key={date.toString()}
            className={cn(
              'text-muted-foreground flex flex-1 items-center justify-center gap-1 pb-2 text-center text-sm',
              [0, 6].includes(i) && 'text-muted-foreground/50'
            )}
          >
            {format(date, 'E', { locale })}
            <span
              className={cn(
                'grid h-6 place-content-center',
                isToday(date) &&
                  'bg-primary text-primary-foreground size-6 rounded-full'
              )}
            >
              {format(date, 'd')}
            </span>
          </div>
        ))}
      </div>
      <div className="relative flex min-w-full flex-1 sm:min-w-[900px]">
        <div className="w-fit">
          <TimeTable
            visibleStartHour={VISIBLE_START}
            visibleEndHour={VISIBLE_END}
          />
        </div>
        <div className="relative grid flex-1 grid-cols-7">
          {isCurrentWeek && showNowLine && (
            <div
              className="pointer-events-none absolute right-0 left-0 z-50 h-[2px] bg-red-500"
              style={{ top: `calc(${nowTop}% - 1px)` }}
            >
              <div className="absolute top-1/2 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500"></div>
            </div>
          )}
          {weekDates.map((hours, i) => {
            return (
              <div
                className={cn(
                  'text-muted-foreground h-full border-l text-sm first:border-l-0',
                  [0, 6].includes(i) && 'bg-muted/50',
                  'cursor-pointer'
                )}
                key={hours[0].toString()}
                onClick={e => {
                  if ((e.target as HTMLElement).closest('[data-event]')) return;
                  onEmptyDateClick?.(hours[0]);
                }}
              >
                {hours.map(hour => (
                  <EventGroup
                    key={hour.toString()}
                    hour={hour}
                    events={events}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const CalendarMonthView = () => {
  const { date, view, events, locale, onEventClick, onEmptyDateClick } =
    useCalendar();

  const monthDates = useMemo(() => {
    if (!date || view !== 'month') return [];
    return getDaysInMonth(date);
  }, [date, view]);

  const weekDays = useMemo(() => generateWeekdays(locale), [locale]);

  if (view !== 'month') return null;

  if (!date) return null;

  return (
    <div className="flex h-full min-w-full flex-col overflow-x-auto overflow-y-auto sm:min-w-[900px]">
      <div className="bg-background sticky top-0 grid min-w-full grid-cols-7 gap-px border-b sm:min-w-[900px]">
        {weekDays.map((day, i) => (
          <div
            key={day}
            className={cn(
              'text-muted-foreground mb-2 pr-2 text-right text-sm',
              [0, 6].includes(i) && 'text-muted-foreground/50'
            )}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="-mt-px grid min-w-full flex-1 auto-rows-fr grid-cols-7 gap-px overflow-y-auto p-px sm:min-w-[900px]">
        {monthDates.map(_date => {
          const currentEvents = events.filter(event =>
            isSameDay(event.start, _date)
          );
          return (
            <div
              className={cn(
                'text-muted-foreground ring-border overflow-auto p-2 text-sm ring-1',
                !isSameMonth(date, _date) && 'text-muted-foreground/50',
                'cursor-pointer'
              )}
              key={_date.toString()}
              onClick={e => {
                if ((e.target as HTMLElement).closest('[data-event]')) return;
                onEmptyDateClick?.(_date);
              }}
            >
              <span
                className={cn(
                  'sticky top-0 mb-1 grid size-6 place-items-center rounded-full',
                  isToday(_date) && 'bg-primary text-primary-foreground'
                )}
              >
                {format(_date, 'd')}
              </span>
              {currentEvents.map(event => {
                const colorClassMap: Record<string, string> = {
                  green: 'bg-green-500/5 dark:bg-green-500/20',
                  indigo: 'bg-indigo-500/5 dark:bg-indigo-500/20',
                  blue: 'bg-blue-500/5 dark:bg-blue-500/20',
                  pink: 'bg-pink-500/5 dark:bg-pink-500/20',
                  purple: 'bg-purple-500/5 dark:bg-purple-500/20',
                  gray: 'bg-gray-500/5 dark:bg-gray-500/20',
                };
                const bgClass =
                  colorClassMap[event.color || 'default'] ||
                  'bg-gray-500/5 dark:bg-gray-500/20';
                return (
                  <div
                    key={event.id}
                    data-event
                    className={cn(
                      'my-1 flex cursor-pointer items-center gap-1 rounded p-1 text-sm',
                      bgClass
                    )}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div
                      className={cn(
                        'shrink-0',
                        monthEventVariants({ variant: event.color })
                      )}
                    ></div>
                    <span className="flex-1 truncate">{event.name}</span>
                    <time className="text-muted-foreground/50 text-xs tabular-nums">
                      {format(event.start, 'HH:mm')}
                    </time>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CalendarNextTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const { date, setDate, view, enableHotkeys } = useCalendar();

  const next = useCallback(() => {
    if (!date) return;
    if (view === 'day') {
      setDate(addDays(date, 1));
    } else if (view === 'week') {
      setDate(addWeeks(date, 1));
    } else if (view === 'month') {
      setDate(addMonths(date, 1));
    } else if (view === 'year') {
      setDate(addYears(date, 1));
    }
  }, [date, view, setDate]);

  useHotkeys('ArrowRight', () => next(), {
    enabled: enableHotkeys,
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    next();
    onClick?.(e);
  };

  return (
    <Button
      size="icon"
      variant="outline"
      ref={ref}
      {...props}
      onClick={handleClick}
      type="button"
    >
      {children}
    </Button>
  );
});

CalendarNextTrigger.displayName = 'CalendarNextTrigger';

export const CalendarPrevTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const { date, setDate, view, enableHotkeys } = useCalendar();

  const prev = useCallback(() => {
    if (!date) return;
    if (view === 'day') {
      setDate(subDays(date, 1));
    } else if (view === 'week') {
      setDate(subWeeks(date, 1));
    } else if (view === 'month') {
      setDate(subMonths(date, 1));
    } else if (view === 'year') {
      setDate(subYears(date, 1));
    }
  }, [date, view, setDate]);

  useHotkeys('ArrowLeft', () => prev(), {
    enabled: enableHotkeys,
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    prev();
    onClick?.(e);
  };

  return (
    <Button
      size="icon"
      variant="outline"
      ref={ref}
      {...props}
      onClick={handleClick}
      type="button"
    >
      {children}
    </Button>
  );
});

CalendarPrevTrigger.displayName = 'CalendarPrevTrigger';

export const CalendarTodayTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const { setDate, enableHotkeys, today } = useCalendar();

  const jumpToToday = useCallback(() => {
    setDate(today);
  }, [today, setDate]);

  useHotkeys('t', () => jumpToToday(), {
    enabled: enableHotkeys,
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    jumpToToday();
    onClick?.(e);
  };

  return (
    <Button
      variant="outline"
      ref={ref}
      {...props}
      onClick={handleClick}
      type="button"
    >
      {children}
    </Button>
  );
});

CalendarTodayTrigger.displayName = 'CalendarTodayTrigger';

export const CalendarCurrentDate = ({
  onClick,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) => {
  const { date, view, setDate, today } = useCalendar();

  const displayDate = date || new Date();
  const formattedDate = format(
    displayDate,
    view === 'day' ? 'dd MMMM yyyy' : 'MMMM yyyy'
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    } else {
      setDate(today);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="ml-4 tabular-nums hover:text-primary transition-colors cursor-pointer font-medium"
      {...props}
      title="Click to jump to today"
    >
      <time dateTime={displayDate.toISOString()}>{formattedDate}</time>
    </button>
  );
};

const TimeTable = ({
  visibleStartHour = 0,
  visibleEndHour = 24,
}: {
  visibleStartHour?: number;
  visibleEndHour?: number;
}) => {
  const hours = Array.from(Array(25).keys()).filter(
    h => h >= visibleStartHour && h <= visibleEndHour + 1
  );

  return (
    <div className="w-12 pr-2">
      {hours.map(hour => {
        return (
          <div
            className="text-muted-foreground/50 relative h-20 text-right text-xs last:h-0"
            key={hour}
          >
            <p className="top-0 -translate-y-1/2">
              {hour === 24 ? 0 : hour}:00
            </p>
          </div>
        );
      })}
    </div>
  );
};

const getDaysInMonth = (date: Date) => {
  const startOfMonthDate = startOfMonth(date);
  const startOfWeekForMonth = startOfWeek(startOfMonthDate, {
    weekStartsOn: 0,
  });
  let currentDate = startOfWeekForMonth;
  const calendar = [];

  while (calendar.length < 42) {
    calendar.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return calendar;
};

const generateWeekdays = (locale: Locale) => {
  const daysOfWeek = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), i);
    daysOfWeek.push(format(date, 'EEEEEE', { locale }));
  }
  return daysOfWeek;
};
