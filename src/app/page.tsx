'use client';

import {useState, useCallback} from 'react';
import {imageToPoem} from '@/ai/flows/image-to-poem';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {toast} from "@/hooks/use-toast"
import {useToast as useToastHook} from "@/hooks/use-toast"
import {Icons} from "@/components/icons"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {cn} from "@/lib/utils";
import {useTranslation} from 'react-i18next';

const categories = [
  "Romantic",
  "Sad",
  "Happy",
  "Angry",
  "Hopeful",
  "Melancholy",
  "Nature",
  "Abstract"
];

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("Romantic"); // Default category
  const [language, setLanguage] = useState<string>("English"); // Default language
  const [isBangla, setIsBangla] = useState<boolean>(false);
  const { toast } = useToastHook()
  const { t } = useTranslation();

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFilename(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImage(base64String);
    };
    reader.readAsDataURL(file);
  }, []);

  const generatePoem = useCallback(async () => {
    if (!image) {
      toast({
        title: "No image uploaded",
        description: "Please upload an image to generate a poem.",
      })
      return;
    }

    setLoading(true);
    try {
      const result = await imageToPoem({photoUrl: image, category, language: isBangla ? "Bangla" : "English"});
      setPoem(result?.poem || 'Failed to generate poem.');
      toast({
        title: "Poem Generated",
        description: "Your poem has been successfully generated",
      })
    } catch (error: any) {
      console.error('Error generating poem:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate poem.",
      })
    } finally {
      setLoading(false);
    }
  }, [image, toast, category, language, isBangla]);

  const savePoem = useCallback(() => {
    if (!poem) {
      toast({
        title: "No poem generated",
        description: "Please generate a poem before saving.",
      })
      return;
    }

    const blob = new Blob([poem], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename ? `${filename.split('.')[0]}_poem.txt` : 'poem.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Poem Saved",
      description: "Your poem has been successfully saved.",
    })
  }, [poem, filename, toast]);

  const shareToTwitter = useCallback(() => {
    if (!poem || !image) {
      toast({
        title: "Cannot share",
        description: "Please generate a poem and upload an image before sharing.",
      });
      return;
    }

    const text = `Check out this poem generated by PhotoPoet!\n\n${poem}\n\n#PhotoPoet #AI #Poetry`;
    const imageUrl = image; // The base64 image data

    const encodedText = encodeURIComponent(text);
    const encodedImageUrl = encodeURIComponent(imageUrl);

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedImageUrl}`; // need to fix accordingly
    window.open(twitterUrl, '_blank');
  }, [poem, image, toast]);

  const shareToFacebook = useCallback(() => {
    if (!poem || !image) {
      toast({
        title: "Cannot share",
        description: "Please generate a poem and upload an image before sharing.",
      });
      return;
    }
    const text = `Check out this poem generated by PhotoPoet!\n\n${poem}\n\n#PhotoPoet #AI #Poetry`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
    window.open(facebookUrl, '_blank');
  }, [poem, image, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">{t('PhotoPoet')}</h1>
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('Image')}</CardTitle>
            <CardDescription>{t('Upload an image to generate a poem.')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
            {image && (
              <div className="mt-4">
                <img
                  src={image}
                  alt={t('Uploaded')}
                  className="max-w-full h-auto rounded-md shadow-md"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('Poem')}</CardTitle>
            <CardDescription>{poem ? t('Generated poem based on the image.') : t('No poem generated yet.')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              <Switch id="isBangla" checked={isBangla} onCheckedChange={setIsBangla} />
              <Label htmlFor="isBangla">{isBangla ? "BN" : "EN"}</Label>
            </div>

            <div className="mb-4">
              <Label htmlFor="category">{t('Category')}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('Select a category')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center">
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                {t('Generating poem...')}
              </div>
            ) : (
              <Textarea
                value={poem || ''}
                placeholder={t('Poem will appear here...')}
                className="min-h-[200px] resize-none"
                onChange={(e) => setPoem(e.target.value)}
                readOnly
              />
            )}

            <div className="flex justify-between mt-4">
              <Button onClick={generatePoem} disabled={loading}>
                {t('Generate Poem')}
              </Button>
              <Button onClick={savePoem} disabled={!poem}>
                {t('Save Poem')}
              </Button>
            </div>
            <div className="flex justify-between mt-4">
              <Button onClick={shareToTwitter} disabled={!poem || !image}>
                {t('Share to Twitter')}
              </Button>
              <Button onClick={shareToFacebook} disabled={!poem || !image}>
                {t('Share to Facebook')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
