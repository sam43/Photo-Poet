import React from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Icons} from "@/components/icons";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {useTranslation} from 'react-i18next';

interface PoemSectionProps {
    poem: string | null;
    setPoem: (poem: string | null) => void;
    loading: boolean;
    generatePoem: () => Promise<void>;
    savePoem: () => void;
    shareToTwitter: () => void;
    shareToFacebook: () => void;
    categories: string[];
    category: string;
    setCategory: (category: string) => void;
    isBangla: boolean;
    setIsBangla: (isBangla: boolean) => void;
    image: string | null;
}

export const PoemSection: React.FC<PoemSectionProps> = ({
                                                          poem,
                                                          setPoem,
                                                          loading,
                                                          generatePoem,
                                                          savePoem,
                                                          shareToTwitter,
                                                          shareToFacebook,
                                                          categories,
                                                          category,
                                                          setCategory,
                                                          isBangla,
                                                          setIsBangla,
                                                          image
                                                      }) => {
    const {t} = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('Poem')}</CardTitle>
                <CardDescription>
                    {poem ? t('Generated poem based on the image.') : t('No poem generated yet.')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 items-center">
                    <Label className="pr-2" htmlFor="language">{t('Language')}</Label>
                    <Switch id="language" checked={isBangla} onCheckedChange={setIsBangla}/>
                </div>

                <div className="my-2 flex flex-wrap gap-2 items-center">
                    <Label className="pr-2" htmlFor="category">{t('Category')}</Label>
                    <Select onValueChange={setCategory}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('Select a category')}/>
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
                    <div className="flex items-center justify-center gap-2">
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>
                        {t('Generating poem...')}
                    </div>
                ) : (
                    <Textarea
                        value={poem || ''}
                        placeholder={t('Poem will appear here...')}
                        className="min-h-[200px] resize-none"
                        onChange={(e) => setPoem(e.target.value)}
                    />
                )}

                <div className="mt-4 flex items-center gap-2">
                    <Button disabled={loading} onClick={generatePoem}>
                        {t('Generate Poem')}
                    </Button>
                    <Button disabled={!poem} onClick={savePoem}>
                        {t('Save Poem')}
                    </Button>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <Button disabled={!poem || !image} onClick={shareToTwitter}>
                        {t('Share to Twitter')}
                    </Button>
                    <Button disabled={!poem || !image} onClick={shareToFacebook}>
                        {t('Share to Facebook')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
};