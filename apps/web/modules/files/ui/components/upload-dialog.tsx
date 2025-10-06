'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import { useState } from 'react';
import { api } from '@workspace/backend/_generated/api';
import { useAction } from 'convex/react';
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@workspace/ui/components/dropzone';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@workspace/ui/components/form';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUploaded?: () => void;
}

const uploadFileSchema = z.object({
  filename: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
});

export function UploadDialog({
  open,
  onOpenChange,
  onFileUploaded,
}: UploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const formMethods = useForm<z.infer<typeof uploadFileSchema>>({
    resolver: zodResolver(uploadFileSchema),
    defaultValues: {
      filename: '',
      category: '',
    },
  });
  const addFile = useAction(api.private.files.addFile);

  const handleFileDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (file) {
      setUploadedFiles([file]);
      if (!formMethods.getValues('filename')) {
        formMethods.setValue('filename', file.name);
      }
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const blob = uploadedFiles[0];
      if (!blob) return;

      const filename = formMethods.getValues('filename') || blob.name;
      const category = formMethods.getValues('category');

      await addFile({
        bytes: await blob.arrayBuffer(),
        filename,
        mimeType: blob.type || 'text/plain',
        category,
      });

      onFileUploaded?.();
      handleCancel();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setUploadedFiles([]);
    formMethods.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload documents to your knowledge base for AI-powered search and
            retrieval.
          </DialogDescription>
        </DialogHeader>
        <Form {...formMethods}>
          <form className="space-y-4">
            <FormField
              control={formMethods.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="category">Category</Label>
                  <FormControl>
                    <Input
                      id="category"
                      className="w-full"
                      type="text"
                      placeholder="e.g., Documentation, Support, Product"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formMethods.control}
              name="filename"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="filename">
                    Filename{' '}
                    <span className="text-xs text-muted-foreground">
                      (Optional)
                    </span>
                  </Label>
                  <FormControl>
                    <Input
                      id="filename"
                      className="w-full"
                      type="text"
                      placeholder="Override default filename"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Dropzone
              accept={{
                'application/pdf': ['.pdf'],
                'text/csv': ['.csv'],
                'text/plain': ['.txt'],
              }}
              disabled={isUploading}
              maxFiles={1}
              onDrop={handleFileDrop}
              src={uploadedFiles}
            >
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
          </form>
        </Form>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isUploading}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            disabled={
              uploadedFiles.length === 0 ||
              isUploading ||
              !formMethods.formState.isValid
            }
            onClick={handleUpload}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
