import RoutePage from '../components/core/wrappers/route-page';
import useApplicationStore from '../components/state/application-state';
import { Zap } from 'lucide-react';
import { Switch } from '../components/ui/switch';

export default function Packages() {
  const { applicationSettings, packages, update, getValue } = useApplicationStore();

  const { genshinImpactData } = applicationSettings;
  const { usedPackages } = genshinImpactData;

  function togglePackage(pkg: string) {
    const currentValue = getValue('applicationSettings').genshinImpactData;

    update('genshinImpactData', {
      ...currentValue,
      usedPackages: currentValue.usedPackages.includes(pkg)
        ? currentValue.usedPackages.filter((name) => name !== pkg)
        : [...currentValue.usedPackages, pkg],
    });
  }

  console.log(usedPackages);

  console.log(packages);

  return (
    <RoutePage className="p-6">
      <div className="w-full">
        <div className="flex flex-col gap-2 text-white pb-6">
          <p className="text-4xl font-bold">Packages</p>
        </div>
        {packages.map((pkg) => {
          return (
            <div
              key={'package' + pkg.name}
              className="flex justify-between text-white bg-component p-4 rounded-xl w-full"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Zap size={20} className="text-yellow-500" fill="currentColor" />
                  <p className="text-xl font-bold">{pkg.display_name}</p>
                </div>

                <p>{pkg.description}</p>
              </div>
              <Switch checked={usedPackages.includes(pkg.name)} onCheckedChange={() => togglePackage(pkg.name)} />
            </div>
          );
        })}
      </div>
    </RoutePage>
  );
}
