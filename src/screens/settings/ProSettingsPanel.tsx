import type { AppCtx } from '../../app/useAppCtx';
import { ProSettingsModeTab } from './ProSettingsModeTab';
import { ProSettingsSessionTab } from './ProSettingsSessionTab';
import { ProSettingsIntervalsTab } from './ProSettingsIntervalsTab';
import { ProSettingsProtocolsTab } from './ProSettingsProtocolsTab';
import { ProSettingsAppTab } from './ProSettingsAppTab';

export function ProSettingsPanel({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, proSettingsTab, setProSettingsTab,
  } = ctx;

  return (
    <div className="md:col-span-2 space-y-4">
      {/* Tab bar */}
      <div className="flex premium-card-quiet p-1.5 rounded-2xl shadow-inner gap-1">
        {[
          { id: 'mode', label: appLanguage === 'en' ? 'Mode' : 'Mode' },
          { id: 'session', label: appLanguage === 'en' ? 'Session' : 'Session' },
          { id: 'intervals', label: appLanguage === 'en' ? 'Interval.' : 'Interval.' },
          { id: 'protocols', label: appLanguage === 'en' ? 'Protoc.' : 'Protoc.' },
          { id: 'app', label: appLanguage === 'en' ? 'App' : 'App' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setProSettingsTab(tab.id as any)}
            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wide transition-all ${
                      proSettingsTab === tab.id ? 'bg-[var(--acc-primary)] text-[var(--acc-on-primary)] shadow-lg' : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="premium-card p-5 rounded-3xl">
        {proSettingsTab === 'mode' && (
          <ProSettingsModeTab ctx={ctx} />
        )}

        {proSettingsTab === 'session' && (
          <ProSettingsSessionTab ctx={ctx} />
        )}

        {proSettingsTab === 'intervals' && (
          <ProSettingsIntervalsTab ctx={ctx} />
        )}

        {proSettingsTab === 'protocols' && (
          <ProSettingsProtocolsTab ctx={ctx} />
        )}
        {proSettingsTab === 'app' && (
          <ProSettingsAppTab ctx={ctx} />
        )}
      </div>
    </div>
  );
}
