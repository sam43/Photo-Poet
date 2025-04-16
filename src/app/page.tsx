
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

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
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
      const result = await imageToPoem({photoUrl: image});
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
  }, [image, toast]);

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
