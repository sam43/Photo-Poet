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

  return (
    
      
        
          
            {t('PhotoPoet')}
          
        

        
          
            
              {t('Image')}
            
            
              {t('Upload an image to generate a poem.')}
            
            
              
                
              
              {image && (
                
                  src={image}
                  alt={t('Uploaded')}
                  className="max-w-full h-auto rounded-md shadow-md"
                />
              )}
            
          
          
            
              {t('Poem')}
            
            
              {poem ? t('Generated poem based on the image.') : t('No poem generated yet.')}
            
            
            
              
              
                
                  
                   
                     {isBangla ? "BN" : "EN"}
                   
                  
                
              

              
                {t('Category')}
                
                  
                    
                      {t('Select a category')}
                    
                  
                  
                    {categories.map((cat) => (
                      
                        {cat}
                      
                    ))}
                  
                
              
            

            {loading ? (
              
                
                  
                
                {t('Generating poem...')}
              
            ) : (
              
                readOnly
                value={poem || ''}
                placeholder={t('Poem will appear here...')}
                className="min-h-[200px] resize-none"
              />
            )}
            
              
                
                  {t('Generate Poem')}
                
                
                  {t('Save Poem')}
                
              
            
          
        
      
    
  );
}
