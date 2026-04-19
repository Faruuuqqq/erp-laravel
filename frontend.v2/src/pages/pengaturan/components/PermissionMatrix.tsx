import { useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, Square } from 'lucide-react';
import { MODULE_GROUPS, PERMISSION_ACTIONS, ALL_MODULES } from '../constants';

export const buildDefaultPermissions = (): Record<string, Record<string, boolean>> => {
  const perms: Record<string, Record<string, boolean>> = {};
  ALL_MODULES.forEach(m => {
    perms[m.key] = { view: true, create: false, update: false, delete: false, print: false };
  });
  return perms;
};

export const buildFullPermissions = (): Record<string, Record<string, boolean>> => {
  const perms: Record<string, Record<string, boolean>> = {};
  ALL_MODULES.forEach(m => {
    perms[m.key] = { view: true, create: true, update: true, delete: true, print: true };
  });
  return perms;
};

interface PermissionMatrixProps {
  permissions: Record<string, Record<string, boolean>>;
  onChange: (p: Record<string, Record<string, boolean>>) => void;
  compact?: boolean;
}

export const PermissionMatrix = ({
  permissions, onChange, compact = false
}: PermissionMatrixProps) => {
  const toggle = useCallback((module: string, action: string) => {
    onChange({
      ...permissions,
      [module]: { ...permissions[module], [action]: !permissions[module]?.[action] },
    });
  }, [permissions, onChange]);

  const toggleRowAll = useCallback((moduleKey: string) => {
    const current = permissions[moduleKey] ?? {};
    const allOn = PERMISSION_ACTIONS.every(a => current[a.key]);
    onChange({
      ...permissions,
      [moduleKey]: Object.fromEntries(PERMISSION_ACTIONS.map(a => [a.key, !allOn])),
    });
  }, [permissions, onChange]);

  const toggleColAll = useCallback((action: string, groupModules: { key: string }[]) => {
    const allOn = groupModules.every(m => permissions[m.key]?.[action]);
    const updated = { ...permissions };
    groupModules.forEach(m => {
      updated[m.key] = { ...updated[m.key], [action]: !allOn };
    });
    onChange(updated);
  }, [permissions, onChange]);

  return (
    <Tabs defaultValue="master" className="w-full">
      <TabsList className="mb-3 h-8">
        {MODULE_GROUPS.map(g => (
          <TabsTrigger key={g.key} value={g.key} className="text-xs px-3 h-7">
            <g.icon className="h-3 w-3 mr-1.5" />{g.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {MODULE_GROUPS.map(group => (
        <TabsContent key={group.key} value={group.key}>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-3 py-2 text-left font-semibold w-40">Modul</th>
                  {PERMISSION_ACTIONS.map(a => (
                    <th key={a.key} className="px-2 py-2 text-center font-semibold min-w-16">
                      <button
                        className="flex flex-col items-center gap-0.5 mx-auto hover:text-foreground transition-colors"
                        onClick={() => toggleColAll(a.key, group.modules)}
                        title={`Toggle semua ${a.label}`}
                        aria-label={`Toggle all ${a.label} permissions`}
                      >
                        <a.icon className="h-3.5 w-3.5" />
                        <span>{a.label}</span>
                      </button>
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center font-semibold text-xs">Semua</th>
                </tr>
              </thead>
              <tbody>
                {group.modules.map((mod, i) => {
                  const modPerms = permissions[mod.key] ?? {};
                  const allOn = PERMISSION_ACTIONS.every(a => modPerms[a.key]);
                  return (
                    <tr key={mod.key} className={`border-b hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                      <td className="px-3 py-2.5 font-medium text-sm">{mod.label}</td>
                      {PERMISSION_ACTIONS.map(a => (
                        <td key={a.key} className="px-2 py-2.5 text-center">
                          {compact ? (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={modPerms[a.key] ?? false}
                                onCheckedChange={() => toggle(mod.key, a.key)}
                                aria-label={`${mod.label} - ${a.label}`}
                              />
                            </div>
                          ) : (
                            <Switch
                              checked={modPerms[a.key] ?? false}
                              onCheckedChange={() => toggle(mod.key, a.key)}
                              className="mx-auto"
                              aria-label={`${mod.label} - ${a.label}`}
                            />
                          )}
                        </td>
                      ))}
                      <td className="px-2 py-2.5 text-center">
                        <button
                          onClick={() => toggleRowAll(mod.key)}
                          className="hover:scale-110 transition-transform"
                          title={allOn ? 'Hapus semua akses' : 'Aktifkan semua akses'}
                          aria-label={allOn ? `Remove all permissions for ${mod.label}` : `Enable all permissions for ${mod.label}`}
                        >
                          {allOn
                            ? <CheckSquare className="h-4 w-4 text-primary mx-auto" aria-hidden="true" />
                            : <Square className="h-4 w-4 text-muted-foreground mx-auto" aria-hidden="true" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
