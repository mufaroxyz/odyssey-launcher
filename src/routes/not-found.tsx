import RoutePage from '../components/core/wrappers/route-page';

export default function NotFound() {
  return (
    <RoutePage>
      <div className="w-full h-full grid place-items-center">
        <div className="flex flex-col items-center">
          <img src="/qiqi_fallen.png" alt="Error" className="w-1/4 h-1/4" />
          <h2 className="text-white">Something went wrong.</h2>
          <p className="text-grey-five font-normal">Seems like this page is not available.</p>

          <p className="flex text-grey-five gap-2">
            If you believe this is an error, file an issue in
            <a target="_blank" href="https://github.com/mufaroxyz/genshin-loader/issues">
              the repository
            </a>
          </p>
        </div>
      </div>
    </RoutePage>
  );
}
