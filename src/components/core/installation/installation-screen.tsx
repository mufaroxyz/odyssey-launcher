import { emit, listen } from '@tauri-apps/api/event';
import { cn, prettifyBytes } from '../../../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import useApplicationStore from '../../state/application-state';
import { Progress } from '../../ui/progress';
import { Button } from '../../ui/button';
import { CircleOff, Pause, Slash } from 'lucide-react';
import { installationCancelFill } from '../../state/application-state.fills';
import { relaunch } from '@tauri-apps/api/process';

const CheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn('w-6 h-6 ', className)}
    >
      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
};

const CheckFilled = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('w-6 h-6 ', className)}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

type LoadingState = {
  text: string;
};

const LoaderCore = ({
  loadingStates,
  value = 0,
  percentage = 0,
  progressOn = 'none',
  current = 0,
  total = 0,
}: {
  loadingStates: LoadingState[];
  value?: number;
  percentage?: number;
  progressOn?: 'installing' | 'unpacking' | 'none';
  current?: number;
  total?: number;
}) => {
  return (
    <div className="flex relative justify-start w-[800px] max-w-2xl mx-auto flex-col mt-[9rem]">
      {loadingStates.map((loadingState, index) => {
        const distance = Math.abs(index - value);
        const opacity = Math.max(1 - distance * 0.2, 0); // Minimum opacity is 0, keep it 0.2 if you're sane.

        return (
          <>
            <motion.div
              key={index}
              className={cn('text-left flex gap-2 mb-4 font-semibold text-xl bg-[#1E1E1E] p-2 rounded-md w-full')}
              initial={{ opacity: 0, y: -(value * 40) }}
              animate={{ opacity: opacity, y: -(value * 40) }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center">
                {index > value && <CheckIcon className="text-white" />}
                {index <= value &&
                  (value === index ? (
                    <Slash size={20} className={cn('text-accent opacity-100 mr-3')} />
                  ) : (
                    <CheckFilled className={cn('text-white')} />
                  ))}
              </div>
              <span className={cn('text-white', value === index && 'text-accent opacity-100')}>
                {loadingState.text}
              </span>
            </motion.div>
          </>
        );
      })}
      <div className="space-y-4 w-full">
        {progressOn != 'none' && (
          <>
            <div>
              <div className="flex items-end justify-between w-full text-white font-semibold mb-1">
                {progressOn === 'installing' && (
                  <>
                    <span className="text-lg">
                      Downloading {prettifyBytes(current)} / {prettifyBytes(total)}
                    </span>
                    <span className="font-bold">{percentage.toFixed(2)}%</span>
                  </>
                )}
                {progressOn === 'unpacking' && (
                  <span className="text-white text-md">
                    Unpacking {prettifyBytes(current)} / {prettifyBytes(total)}
                  </span>
                )}
              </div>
              <Progress value={percentage} />
            </div>
            <div className="flex w-full px-20 gap-2 z-30">
              <Button
                disabled
                icon={<CircleOff size={20} />}
                onClick={() => {
                  emit('installation-request-cancel');
                }}
                className="flex-grow flex justify-between flex-row-reverse z-30"
                variant="dark"
              >
                Cancel
              </Button>
              <Button
                icon={<Pause size={20} />}
                disabled={progressOn !== 'installing'}
                onClick={async () => {
                  console.log('hello');
                  // emit("installation-request-pause");
                  await relaunch();
                }}
                className="flex-grow flex justify-between flex-row-reverse z-30"
                variant="dark"
              >
                Pause
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const InstallationScreen = ({
  loadingStates,
  loading,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
}) => {
  const { installationContext, updateGlobal, getValue, update, applicationSettings } = useApplicationStore();

  useEffect(() => {
    const unlistenStateMoveRequest = listen(
      'installation-next-step',
      (event: {
        payload: {
          step: number;
        };
      }) => {
        const installationContext = getValue('installationContext');

        update('lastInstallationStep', event.payload.step);

        updateGlobal('installationContext', {
          ...installationContext,
          isInstalling: true,
          currentStep: event.payload.step,
        });
      },
    );

    /**
     * using getValue is needed here because for some reason the state doesn't use the updated values from the application store.
     * This might be due to React strict mode in development.
     */

    const installationProgress = listen(
      'installation-progress',
      (event: {
        payload: {
          percentage: number;
          downloaded: number;
          total: number;
        };
      }) => {
        const installationContext = getValue('installationContext');

        updateGlobal('installationContext', {
          ...installationContext,
          progressPercentage: event.payload?.percentage,
          progressOn: 'installing',
          progress: {
            current: event.payload?.downloaded,
            total: event.payload?.total,
          },
        });
      },
    );

    const unpackingProgress = listen(
      'installation-unpacking',
      (event: {
        payload: {
          percentage: number;
          unpacked: number;
          total: number;
        };
      }) => {
        const installationContext = getValue('installationContext');

        updateGlobal('installationContext', {
          ...installationContext,
          progressPercentage: event.payload?.percentage,
          progressOn: 'unpacking',
          progress: {
            current: event.payload?.unpacked,
            total: event.payload?.total,
          },
        });
      },
    );

    const installationPaused = listen('installation-paused', () => {
      const installationContext = getValue('installationContext');

      updateGlobal('installationContext', {
        ...installationContext,
        ...installationCancelFill,
      });
    });

    const installationFinish = listen('installation-finish', () => {
      const paths = localStorage.getItem('installationPaths');
      const installationContext = getValue('installationContext');

      if (!paths) return;

      const parsed = JSON.parse(paths);

      update('genshinImpactData', {
        path: parsed.installationPath,
      });

      updateGlobal('installationContext', {
        ...installationContext,
        ...installationCancelFill,
        isInstalling: false,
        currentStep: 0,
        progressPercentage: 0,
        progressOn: 'none',
        progress: {
          current: 0,
          total: 0,
        },
      });
    });

    const setCurrentStep = listen('installation-running-step', () => {
      const installationContext = getValue('installationContext');

      updateGlobal('installationContext', {
        ...installationContext,
        isInstalling: true,
        currentStep: applicationSettings.lastInstallationStep,
      });
    });

    return () => {
      unlistenStateMoveRequest.then((ul) => ul());
      installationProgress.then((ul) => ul());
      unpackingProgress.then((ul) => ul());
      installationPaused.then((ul) => ul());
      installationFinish.then((ul) => ul());
      setCurrentStep.then((ul) => ul());
    };
  }, [installationContext]);
  return (
    <AnimatePresence mode="wait">
      {loading && (
        <>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="w-full h-full absolute inset-0 z-[100]  flex items-center justify-center backdrop-blur-2xl"
          >
            <div className="h-fit  relative">
              <LoaderCore
                value={installationContext.currentStep}
                percentage={installationContext.progressPercentage}
                progressOn={installationContext?.progressOn}
                current={installationContext?.progress?.current}
                total={installationContext?.progress?.total}
                loadingStates={loadingStates}
              />
            </div>

            <div className="bg-gradient-to-t inset-x-0 z-20 bottom-0 bg-white dark:bg-black h-full absolute [mask-image:radial-gradient(900px_at_center,transparent_30%,white)]" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
