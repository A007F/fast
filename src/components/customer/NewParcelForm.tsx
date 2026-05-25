'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  FileText,
  CreditCard,
  Package,
  Wallet,
  Banknote,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const CUSTOMER_ID = 'cmpjwmuhx0001kjlwxykih2nm';

const steps = [
  { id: 1, label: 'معلومات المرسل', icon: MapPin },
  { id: 2, label: 'معلومات المستلم', icon: FileText },
  { id: 3, label: 'تفاصيل الطرد', icon: Package },
  { id: 4, label: 'الدفع والتأكيد', icon: CreditCard },
];

const categories = [
  { value: 'DOCUMENTS', label: 'وثائق', icon: '📄' },
  { value: 'FOOD', label: 'طعام', icon: '🍽️' },
  { value: 'ELECTRONICS', label: 'إلكترونيات', icon: '📱' },
  { value: 'CLOTHES', label: 'ملابس', icon: '👕' },
  { value: 'OTHER', label: 'أخرى', icon: '📦' },
];

const sizes = [
  { value: 'SMALL', label: 'صغير', desc: 'حتى 2 كجم', dim: '30×20×10 سم' },
  { value: 'MEDIUM', label: 'متوسط', desc: 'حتى 10 كجم', dim: '50×40×30 سم' },
  { value: 'LARGE', label: 'كبير', desc: 'حتى 25 كجم', dim: '80×60×50 سم' },
];

const paymentMethods = [
  { value: 'CASH', label: 'نقدي', icon: Banknote, desc: 'الدفع عند الاستلام' },
  { value: 'CARD', label: 'بطاقة', icon: CreditCard, desc: 'بطاقة ائتمان' },
  { value: 'WALLET', label: 'محفظة', icon: Wallet, desc: 'رصيد المحفظة' },
];

interface FormData {
  // Sender
  senderAddress: string;
  senderNotes: string;
  // Receiver
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverNotes: string;
  // Parcel
  category: string;
  weight: string;
  size: string;
  description: string;
  // Payment
  codAmount: string;
  paymentMethod: string;
}

interface NewParcelFormProps {
  onSuccess?: () => void;
}

export default function NewParcelForm({ onSuccess }: NewParcelFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    senderAddress: '',
    senderNotes: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    receiverNotes: '',
    category: '',
    weight: '',
    size: '',
    description: '',
    codAmount: '',
    paymentMethod: 'CASH',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!form.senderAddress.trim()) {
          toast.error('يرجى إدخال عنوان المرسل');
          return false;
        }
        return true;
      case 2:
        if (!form.receiverName.trim()) {
          toast.error('يرجى إدخال اسم المستلم');
          return false;
        }
        if (!form.receiverPhone.trim()) {
          toast.error('يرجى إدخال رقم هاتف المستلم');
          return false;
        }
        if (!form.receiverAddress.trim()) {
          toast.error('يرجى إدخال عنوان المستلم');
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setSubmitting(true);

    try {
      const deliveryFee = form.size === 'SMALL' ? 35 : form.size === 'MEDIUM' ? 50 : 75;

      const payload = {
        senderId: CUSTOMER_ID,
        senderAddress: form.senderAddress,
        senderLat: 24.7136 + Math.random() * 0.01,
        senderLng: 46.6753 + Math.random() * 0.01,
        senderNotes: form.senderNotes || undefined,
        receiverName: form.receiverName,
        receiverPhone: form.receiverPhone,
        receiverAddress: form.receiverAddress,
        receiverLat: 24.7136 + Math.random() * 0.1,
        receiverLng: 46.6753 + Math.random() * 0.1,
        receiverNotes: form.receiverNotes || undefined,
        category: form.category || undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        size: form.size || undefined,
        description: form.description || undefined,
        codAmount: form.codAmount ? parseFloat(form.codAmount) : undefined,
        paymentMethod: form.paymentMethod,
        deliveryFee,
      };

      const res = await fetch('/api/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast.success('تم إنشاء الطلب بنجاح! 🎉', {
          description: `رقم التتبع: ${json.data.trackingNumber}`,
          duration: 5000,
        });
        onSuccess?.();
      } else {
        toast.error(json.error || 'حدث خطأ أثناء إنشاء الطلب');
      }
    } catch (err) {
      console.error('خطأ:', err);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  const deliveryFee = form.size === 'SMALL' ? 35 : form.size === 'MEDIUM' ? 50 : form.size === 'LARGE' ? 75 : 0;

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between px-2">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? 'rgb(5 150 105)'
                      : isCurrent
                        ? 'rgb(5 150 105)'
                        : 'rgb(229 229 229)',
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isCompleted || isCurrent
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </motion.div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mt-[-20px] sm:mt-[-32px]">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: '0%' }}
                    animate={{
                      width: isCompleted ? '100%' : '0%',
                      backgroundColor: isCompleted ? 'rgb(5 150 105)' : 'rgb(229 229 229)',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step indicator text */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          الخطوة {currentStep} من 4
        </p>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Step 1: Sender Info */}
          {currentStep === 1 && (
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  معلومات المرسل
                </CardTitle>
                <p className="text-sm text-muted-foreground">بيانات العنوان الذي سيتم استلام الطرد منه</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senderAddress">عنوان الاستلام <span className="text-red-500">*</span></Label>
                  <Input
                    id="senderAddress"
                    placeholder="أدخل عنوان الاستلام بالتفصيل"
                    value={form.senderAddress}
                    onChange={(e) => updateField('senderAddress', e.target.value)}
                  />
                </div>

                {/* Map placeholder */}
                <div className="space-y-2">
                  <Label>تحديد الموقع على الخريطة</Label>
                  <button className="w-full h-40 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-muted/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                    <MapPin className="h-8 w-8" />
                    <span className="text-sm font-medium">اضغط لتحديد الموقع</span>
                    <span className="text-xs">(قريباً)</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderNotes">ملاحظات <span className="text-muted-foreground font-normal">(اختياري)</span></Label>
                  <Textarea
                    id="senderNotes"
                    placeholder="ملاحظات إضافية للكابتن..."
                    value={form.senderNotes}
                    onChange={(e) => updateField('senderNotes', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Receiver Info */}
          {currentStep === 2 && (
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  معلومات المستلم
                </CardTitle>
                <p className="text-sm text-muted-foreground">بيانات الشخص الذي سيتم التسليم إليه</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiverName">اسم المستلم <span className="text-red-500">*</span></Label>
                    <Input
                      id="receiverName"
                      placeholder="الاسم الكامل"
                      value={form.receiverName}
                      onChange={(e) => updateField('receiverName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receiverPhone">رقم الهاتف <span className="text-red-500">*</span></Label>
                    <Input
                      id="receiverPhone"
                      placeholder="+9665XXXXXXXX"
                      value={form.receiverPhone}
                      onChange={(e) => updateField('receiverPhone', e.target.value)}
                      dir="ltr"
                      className="text-left"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiverAddress">عنوان التسليم <span className="text-red-500">*</span></Label>
                  <Input
                    id="receiverAddress"
                    placeholder="أدخل عنوان التسليم بالتفصيل"
                    value={form.receiverAddress}
                    onChange={(e) => updateField('receiverAddress', e.target.value)}
                  />
                </div>

                {/* Map placeholder */}
                <div className="space-y-2">
                  <Label>تحديد موقع التسليم</Label>
                  <button className="w-full h-40 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-muted/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                    <MapPin className="h-8 w-8" />
                    <span className="text-sm font-medium">اضغط لتحديد الموقع</span>
                    <span className="text-xs">(قريباً)</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiverNotes">ملاحظات <span className="text-muted-foreground font-normal">(اختياري)</span></Label>
                  <Textarea
                    id="receiverNotes"
                    placeholder="ملاحظات إضافية للتسليم..."
                    value={form.receiverNotes}
                    onChange={(e) => updateField('receiverNotes', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Parcel Details */}
          {currentStep === 3 && (
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  تفاصيل الطرد
                </CardTitle>
                <p className="text-sm text-muted-foreground">حدد نوع الطرد وحجمه</p>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Category */}
                <div className="space-y-2">
                  <Label>الفئة</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => updateField('category', cat.value)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                          form.category === cat.value
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-xs font-medium">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <Label>الحجم</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {sizes.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => updateField('size', s.value)}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          form.size === s.value
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <p className="text-sm font-bold text-foreground">{s.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{s.dim}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <Label htmlFor="weight">الوزن (كجم) <span className="text-muted-foreground font-normal">(اختياري)</span></Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="0.0"
                    min="0.1"
                    step="0.1"
                    value={form.weight}
                    onChange={(e) => updateField('weight', e.target.value)}
                    dir="ltr"
                    className="text-left"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف <span className="text-muted-foreground font-normal">(اختياري)</span></Label>
                  <Textarea
                    id="description"
                    placeholder="وصف محتويات الطرد..."
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Payment & Review */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {/* Payment Method */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    طريقة الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={form.paymentMethod}
                    onValueChange={(val) => updateField('paymentMethod', val)}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                  >
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <label
                          key={method.value}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            form.paymentMethod === method.value
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <RadioGroupItem value={method.value} className="sr-only" />
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            form.paymentMethod === method.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{method.label}</p>
                            <p className="text-xs text-muted-foreground">{method.desc}</p>
                          </div>
                          {form.paymentMethod === method.value && (
                            <Check className="h-4 w-4 text-primary mr-auto" />
                          )}
                        </label>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* COD Amount */}
              <Card className="border-border/50">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="codAmount">مبلغ الدفع عند الاستلام (ر.س) <span className="text-muted-foreground font-normal">(اختياري)</span></Label>
                    <Input
                      id="codAmount"
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={form.codAmount}
                      onChange={(e) => updateField('codAmount', e.target.value)}
                      dir="ltr"
                      className="text-left"
                    />
                    <p className="text-xs text-muted-foreground">المبلغ الذي سيجمعه الكابتن من المستلم عند التسليم</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-primary">ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">عنوان الاستلام</span>
                      <span className="font-medium text-foreground text-left max-w-[60%] truncate">
                        {form.senderAddress || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المستلم</span>
                      <span className="font-medium text-foreground">{form.receiverName || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">هاتف المستلم</span>
                      <span className="font-medium text-foreground" dir="ltr">{form.receiverPhone || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">عنوان التسليم</span>
                      <span className="font-medium text-foreground text-left max-w-[60%] truncate">
                        {form.receiverAddress || '—'}
                      </span>
                    </div>
                    {form.category && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الفئة</span>
                        <span className="font-medium text-foreground">
                          {categories.find((c) => c.value === form.category)?.label}
                        </span>
                      </div>
                    )}
                    {form.size && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الحجم</span>
                        <span className="font-medium text-foreground">
                          {sizes.find((s) => s.value === form.size)?.label}
                        </span>
                      </div>
                    )}
                    {form.weight && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الوزن</span>
                        <span className="font-medium text-foreground">{form.weight} كجم</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-primary/20 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">رسوم التوصيل</span>
                      <span className="font-medium text-foreground">{deliveryFee} ر.س</span>
                    </div>
                    {form.codAmount && parseFloat(form.codAmount) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">الدفع عند الاستلام</span>
                        <span className="font-medium text-foreground">{form.codAmount} ر.س</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-primary/20">
                      <span className="text-primary">الإجمالي</span>
                      <span className="text-primary">{deliveryFee + (form.codAmount ? parseFloat(form.codAmount) : 0)} ر.س</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      {paymentMethods.find((m) => m.value === form.paymentMethod)?.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        {currentStep > 1 ? (
          <Button
            variant="outline"
            onClick={prevStep}
            className="border-primary/30 text-primary hover:bg-primary/5"
          >
            <ArrowRight className="h-4 w-4 ml-1" />
            السابق
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 4 ? (
          <Button
            onClick={nextStep}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            التالي
            <ArrowLeft className="h-4 w-4 mr-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 min-w-[140px]"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                جارٍ الإرسال...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 ml-1" />
                تأكيد الطلب
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
