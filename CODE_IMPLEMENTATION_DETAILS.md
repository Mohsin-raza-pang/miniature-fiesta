# Madani Notes Code Implementation Details

This document contains the implementation details of key features added to the Madani Notes application, including the code for uploading and displaying images in notes.

## Image Upload Implementation

### Rich Text Editor Component

The key component modified for image upload functionality is the `RichTextEditor` component in `client/src/components/ui/rich-text-editor.tsx`. Here's the full implementation:

```tsx
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter, 
  Type,
  ChevronDown,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxHeight?: string;
  className?: string;
}

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Start typing...", 
  maxHeight = "400px",
  className = ""
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [characters, setCharacters] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  // Initialize editor with value
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
      setCharacters(countCharacters(value));
    }
  }, [value]);
  
  // Count characters (excluding HTML tags)
  const countCharacters = (html: string) => {
    if (!html) return 0;
    // Create temp element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    // Get text content (excludes HTML tags)
    return temp.textContent?.length || 0;
  };
  
  // Handle input changes
  const handleInput = () => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    onChange(content);
    setCharacters(countCharacters(content));
    
    // Add placeholder styling when empty
    if (editorRef.current.textContent?.trim() === '') {
      editorRef.current.classList.add('empty');
    } else {
      editorRef.current.classList.remove('empty');
    }
  };
  
  // Execute command function for formatting
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };
  
  // Handle image upload button click
  const handleImageUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle image file selection
  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setIsUploading(true);
      
      const file = files[0];
      // Convert to base64 instead of uploading to server
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target?.result as string;
        
        // Insert the base64 image at cursor position
        const imageHTML = `<img src="${base64Image}" alt="Inserted image" style="max-width: 100%; margin: 10px 0; display: block;" />`;
        document.execCommand('insertHTML', false, imageHTML);
        
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
        
        toast({
          title: "Image inserted",
          description: "Image has been added to your note",
        });
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        setIsUploading(false);
      };
      
      reader.onerror = () => {
        throw new Error('Failed to read the image file');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };
  
  // Define the type for format actions
  type FormatAction = 
    | { icon: React.ReactNode; command: string; title: string; value?: string; divider?: never }
    | { divider: true; icon?: never; command?: never; title?: never; value?: never };
  
  // Format buttons
  const formatActions: FormatAction[] = [
    { icon: <Bold size={18} />, command: 'bold', title: 'Bold' },
    { icon: <Italic size={18} />, command: 'italic', title: 'Italic' },
    { icon: <Underline size={18} />, command: 'underline', title: 'Underline' },
    { divider: true },
    { icon: <List size={18} />, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: <ListOrdered size={18} />, command: 'insertOrderedList', title: 'Numbered List' },
    { divider: true },
    { icon: <AlignLeft size={18} />, command: 'justifyLeft', title: 'Align Left' },
    { icon: <AlignCenter size={18} />, command: 'justifyCenter', title: 'Align Center' },
    { icon: <AlignRight size={18} />, command: 'justifyRight', title: 'Align Right' },
    { divider: true },
    { icon: <Highlighter size={18} />, command: 'hiliteColor', value: '#ffeb3b', title: 'Highlight' },
  ];
  
  // Font size options
  const fontSizes = [
    { label: 'Small', value: '1' },
    { label: 'Normal', value: '3' },
    { label: 'Large', value: '5' },
    { label: 'Huge', value: '7' },
  ];

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageFileSelected}
      />
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-muted rounded-t-lg p-2">
        {formatActions.map((action, index) => (
          action.divider ? (
            <span key={index} className="border-r border-border h-6 mx-1" />
          ) : (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 px-2 rounded"
              title={action.title}
              onClick={() => execCommand(action.command, action.value)}
            >
              {action.icon}
            </Button>
          )
        ))}
        
        {/* Image upload button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 px-2 rounded"
          title="Insert Image"
          onClick={handleImageUploadClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ImageIcon size={18} />
          )}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 px-2 ml-auto rounded flex items-center">
              <Type size={18} className="mr-1" />
              <span className="text-sm">Size</span>
              <ChevronDown size={16} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {fontSizes.map((size) => (
              <DropdownMenuItem
                key={size.value}
                onClick={() => execCommand('fontSize', size.value)}
                className={`text-${size.label.toLowerCase()}`}
              >
                {size.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        className="bg-background border border-input rounded-b-lg p-4 overflow-y-auto overflow-x-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ 
          minHeight: "8rem", 
          maxHeight,
          wordWrap: "break-word",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap"
        }}
        contentEditable="true"
        onInput={handleInput}
        data-placeholder={placeholder}
      />
      
      {/* Character count */}
      <div className="text-sm text-muted-foreground mt-2">
        {characters} characters
      </div>
    </div>
  );
};

export default RichTextEditor;
```

## Note Preview Implementation

The fullscreen preview dialog component in `client/src/components/modals/fullscreen-preview-dialog.tsx` was updated to properly display images embedded in notes:

```tsx
import { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, X } from "lucide-react";

interface FullscreenPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const FullscreenPreviewDialog = ({ 
  open, 
  onClose, 
  title, 
  content 
}: FullscreenPreviewDialogProps) => {
  const [zoomLevel, setZoomLevel] = useState(100);

  const increaseZoom = () => {
    if (zoomLevel < 200) {
      setZoomLevel(prev => prev + 10);
    }
  };

  const decreaseZoom = () => {
    if (zoomLevel > 50) {
      setZoomLevel(prev => prev - 10);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] h-[90vh] w-full flex flex-col">
        <DialogHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-bold truncate mr-2">{title}</DialogTitle>
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <Button 
              variant="outline" 
              size="icon"
              onClick={decreaseZoom}
              disabled={zoomLevel <= 50}
              className="h-8 w-8 sm:h-9 sm:w-9 bg-background dark:bg-background border-border"
            >
              <ZoomOut className="h-4 w-4 text-foreground" />
            </Button>
            <span className="text-xs sm:text-sm whitespace-nowrap text-foreground">{zoomLevel}%</span>
            <Button 
              variant="outline" 
              size="icon"
              onClick={increaseZoom}
              disabled={zoomLevel >= 200}
              className="h-8 w-8 sm:h-9 sm:w-9 bg-background dark:bg-background border-border"
            >
              <ZoomIn className="h-4 w-4 text-foreground" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={onClose}
              className="h-8 w-8 sm:h-9 sm:w-9 bg-background dark:bg-background border-border"
            >
              <X className="h-5 w-5 text-foreground" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-card rounded-lg shadow-md border border-border/50 my-4" style={{ zoom: `${zoomLevel}%` }}>
          <div 
            className="prose dark:prose-invert max-w-none break-words text-foreground whitespace-pre-wrap min-h-full"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        
        <DialogFooter className="mt-2 sm:mt-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FullscreenPreviewDialog;
```

## Additional Components and Configurations

### 1. Static File Serving in `server/routes.ts`

The server was configured to serve static uploaded files:

```typescript
// Serve uploaded files
app.use("/uploads", express.static(uploadDir, { setHeaders: (res) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.setHeader('Access-Control-Allow-Origin', '*');
}}) as express.RequestHandler);
```

### 2. CSS Styling in `client/src/index.css`

CSS for preserving whitespace and formatting in the editor and preview:

```css
/* Editor content styling */
[contenteditable] {
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Editor placeholder styling */
[contenteditable].empty:before {
  content: attr(data-placeholder);
  color: var(--color-placeholder);
  pointer-events: none;
  position: absolute;
}

/* Make sure images display properly */
.prose img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem 0;
}
```

## Steps for Local Setup

1. **Clone the repository** to your local machine

2. **Install dependencies**:
```bash
npm install
```

3. **Database setup**:
   - Create a PostgreSQL database
   - Set up your `.env` file with the connection string:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/madani_notes
   ```

4. **Database initialization**:
```bash
npm run db:push
npm run db:seed
```

5. **Start the development server**:
```bash
npm run dev
```

6. **Access the application** by opening your browser to `http://localhost:5000`

## Notes on Image Handling

1. **Base64 Encoding**: Images are encoded as base64 strings and stored directly in the note content, eliminating the need for server-side file storage.

2. **Pros and Cons**:
   - **Pros**: Simple implementation, no file management required
   - **Cons**: Increased database storage size for notes with many images

3. **Alternative Approaches** (if needed in the future):
   - Store images in a dedicated file system or cloud storage
   - Use a CDN for better performance
   - Compress images before storing them

4. **Performance Considerations**:
   - For larger applications, consider adding image compression
   - Set maximum file size limits for uploaded images
   - Implement lazy loading for images in notes with many images

5. **Browser Compatibility**:
   - Base64 image embedding works in all modern browsers
   - The rich text editor uses standard browser APIs like `document.execCommand()`

This document contains the implementation details for setting up Madani Notes on your local system, with a particular focus on the image upload functionality using base64 encoding.