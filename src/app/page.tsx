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
  const [isBangla, setIsBangla] = useState(false);
  const { toast } = useToastHook()

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
        description: "Your poem has been successfully generated.",
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">PhotoPoet</h1>

      <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Image</CardTitle>
            <CardDescription>Upload an image to generate a poem.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
            {image && (
              <img
                src={image}
                alt="Uploaded"
                className="max-w-full h-auto rounded-md shadow-md"
              />
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Poem</CardTitle>
            <CardDescription>
              {poem ? 'Generated poem based on the image.' : 'No poem generated yet.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-center mb-4">
                <Switch
                  id="language"
                  checked={isBangla}
                  onCheckedChange={setIsBangla}
                  className={cn("w-[5rem] h-[2.5rem] data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary relative rounded-full")}
                >
                  <span className={cn("absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-center transition-all duration-300 data-[state=checked]:right-0 data-[state=checked]:left-auto",
                  isBangla ? "text-white" : "text-gray-500"
                  )}>
                    {isBangla ? "BN" : "EN"}
                  </span>
                </Switch>
              </div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={setCategory} defaultValue={category}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
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
                <Icons.spinner className="animate-spin h-6 w-6 mr-2" />
                Generating poem...
              </div>
            ) : (
              <Textarea
                readOnly
                value={poem || ''}
                placeholder="Poem will appear here..."
                className="min-h-[200px] resize-none"
              />
            )}
            <div className="flex justify-end mt-4">
              <Button onClick={generatePoem} disabled={loading} className="mr-2">
                Generate Poem
              </Button>
              <Button variant="secondary" onClick={savePoem} disabled={loading || !poem}>
                Save Poem
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
