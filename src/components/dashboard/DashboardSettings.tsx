'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  DollarSign,
  Package,
  Percent,
  CreditCard,
  Radar,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface SettingsForm {
  defaultDeliveryFee: string;
  minOrderAmount: string;
  platformCommission: string;
  codEnabled: boolean;
  trackingRadius: string;
}

const defaultSettings: SettingsForm = {
  defaultDeliveryFee: '15',
  minOrderAmount: '10',
  platformCommission: '15',
  codEnabled: true,
  trackingRadius: '50',
};

export default function DashboardSettings() {
  const [settings, setSettings] = useState<SettingsForm>(defaultSettings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  const settingsSections = [
    {
      title: 'إعدادات الرسوم',
      description: 'تحكم في رسوم التوصيل والحدود المالية',
      icon: DollarSign,
      fields: [
        {
          key: 'defaultDeliveryFee' as const,
          label: 'رسوم التوصيل الأساسية',
          description: 'الرسوم الافتراضية لكل طرد (ر.س)',
          type: 'number',
          icon: DollarSign,
        },
        {
          key: 'minOrderAmount' as const,
          label: 'الحد الأدنى للطلب',
          description: 'أقل قيمة مسموح بها للطلب (ر.س)',
          type: 'number',
          icon: Package,
        },
        {
          key: 'platformCommission' as const,
          label: 'نسبة المنصة',
          description: 'نسبة العمولة التي تحصل عليها المنصة من كل توصيل',
          type: 'number',
          icon: Percent,
        },
      ],
    },
    {
      title: 'إعدادات الدفع',
      description: 'خيارات الدفع المتاحة على المنصة',
      icon: CreditCard,
      fields: [
        {
          key: 'codEnabled' as const,
          label: 'تفعيل الدفع عند الاستلام',
          description: 'السماح للعملاء بالدفع عند استلام الطرد',
          type: 'toggle',
        },
      ],
    },
    {
      title: 'إعدادات التتبع',
      description: 'إعدادات التتبع الجغرافي والموقع',
      icon: Radar,
      fields: [
        {
          key: 'trackingRadius' as const,
          label: 'نطاق التتبع الجغرافي',
          description: 'نصف قطر التتبع الجغرافي (كم)',
          type: 'number',
          icon: Radar,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-bold text-foreground">إعدادات المنصة</h2>
        <p className="text-sm text-muted-foreground mt-1">
          إدارة إعدادات النظام والرسوم والتفضيلات
        </p>
      </motion.div>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => {
        const SectionIcon = section.icon;

        return (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <SectionIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {section.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.fields.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-foreground">
                        {field.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {field.description}
                      </p>
                    </div>
                    <div className="mr-4">
                      {field.type === 'toggle' ? (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={
                              settings[field.key] as unknown as boolean
                            }
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                [field.key]: checked,
                              })
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            {settings[field.key] ? 'مفعّل' : 'معطّل'}
                          </span>
                        </div>
                      ) : (
                        <Input
                          type="number"
                          step="any"
                          value={settings[field.key]}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              [field.key]: e.target.value,
                            })
                          }
                          className="w-28 h-9 text-left"
                          dir="ltr"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  معلومة مهمة
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  تغييرات الإعدادات تنطبق على الطلبات الجديدة فقط. لن تتأثر
                  الطلبات الحالية بأي تغييرات. تأكد من مراجعة جميع الإعدادات
                  قبل الحفظ.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end"
      >
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 ml-2" />
              حفظ الإعدادات
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
