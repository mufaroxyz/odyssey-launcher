import RoutePage from "../components/core/wrappers/route-page";

export default function Packages() {
  return (
    <RoutePage className="p-6">
      <p className="absolute top-1/2 left-1/2 translate-x-[-50%] text-white text-xl">
        There are no packages available at the moment.
      </p>
      <div>
        <div className="flex flex-col gap-2 text-white">
          <p className="text-4xl font-bold">Packages</p>
        </div>
      </div>
    </RoutePage>
  );
}
