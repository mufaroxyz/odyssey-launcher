import { useShallow } from 'zustand/react/shallow';
import useApplicationStore from '../../state/application-state';
import { useCallback, useMemo } from 'react';
import { NotificationsTabs, Tab } from './notifications-tabs';

const notificationVariants = {
  POST_TYPE_ANNOUNCE: 'Announcements',
  POST_TYPE_ACTIVITY: 'Activities',
  POST_TYPE_INFO: 'Info',
};

export default function Notifications() {
  const { posts } = useApplicationStore(
    useShallow((state) => ({
      posts: state.images.post,
    })),
  );

  const tabsCallback = useCallback(() => {
    const initialTabs: Tab[] = [
      {
        title: notificationVariants.POST_TYPE_ANNOUNCE,
        value: 'announcements',
        content: posts
          .filter((post) => post.type === 'POST_TYPE_ANNOUNCE')
          .map((post) => {
            return <Notification title={post.title} show_time={post.show_time} url={post.url} />;
          }),
      },
      {
        title: notificationVariants.POST_TYPE_ACTIVITY,
        value: 'activities',
        content: posts
          .filter((post) => post.type === 'POST_TYPE_ACTIVITY')
          .map((post) => {
            return <Notification title={post.title} show_time={post.show_time} url={post.url} />;
          }),
      },
      {
        title: notificationVariants.POST_TYPE_INFO,
        value: 'info',
        content: posts
          .filter((post) => post.type === 'POST_TYPE_INFO')
          .map((post) => {
            return <Notification title={post.title} show_time={post.show_time} url={post.url} />;
          }),
      },
    ];

    return initialTabs;
  }, []);

  const tabs = useMemo(() => tabsCallback(), [posts]);

  return (
    <div className="h-[200px] bg-bg-color rounded-lg">
      <NotificationsTabs tabs={tabs} />
    </div>
  );
}

function Notification({ title, show_time, url }: { title: string; show_time: string; url: string }) {
  return (
    <>
      <div className="relative flex justify-between w-full gap-4 p-2 flex-row items-center bg-button-hover rounded-md cursor-pointer">
        <a
          href={url}
          target="_blank"
          className="absolute bg-transparent focus:bg-transparent hover:bg-transparent z-10 h-full rounded-none -translate-x-2 w-full"
        ></a>
        <h1 className="text-sm font-semibold text-neutral-300">{title}</h1>
        <p className="text-xs text-white">{show_time}</p>
      </div>
    </>
  );
}
