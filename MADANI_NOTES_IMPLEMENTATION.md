# Madani Notes Implementation Documentation

This document provides a comprehensive overview of the implementation of Madani Notes, a professional notepad application with advanced text editing capabilities. This document will help you recreate the application on your local environment.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Key Features](#key-features)
5. [Database Schema](#database-schema)
6. [Setting Up Locally](#setting-up-locally)

## Project Structure

The project follows a client-server architecture with:

- **Frontend**: React with TypeScript, styled using Tailwind CSS and Shadcn UI components
- **Backend**: Express.js server with RESTful API endpoints
- **Database**: PostgreSQL with Drizzle ORM

Key directories:
- `/client/src` - Frontend React application
- `/server` - Express backend
- `/db` - Database configuration and seed files
- `/shared` - Shared schema definitions
- `/public` - Static assets

## Backend Implementation

The backend is built with Express.js and provides RESTful API endpoints for categories and notes management.

### Key Backend Files

#### `server/routes.ts`

Sets up API routes for categories and notes. Example routes:

```typescript
// Categories API
app.get(`${apiPrefix}/categories`, async (req, res) => {
  try {
    const allCategories = await storage.getAllCategories();
    res.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Notes API
app.get(`${apiPrefix}/categories/:categoryId/notes`, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const notes = await storage.getNotesByCategoryId(parseInt(categoryId));
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});
```

#### `server/storage.ts`

Provides an abstraction for database operations:

```typescript
export const storage = {
  // Category operations
  getAllCategories: async () => {
    return db.query.categories.findMany();
  },
  
  // Note operations
  createNote: async (params: NoteCreateParams) => {
    const [note] = await db.insert(notes)
      .values({
        title: params.title,
        content: params.content,
        categoryId: params.categoryId,
        userId: params.userId,
        isPinned: params.isPinned || false,
        isFavorite: params.isFavorite || false,
      })
      .returning();
    return note;
  },
}
```

## Frontend Implementation

The frontend is built with React, TypeScript, and styled with Tailwind CSS. It uses Shadcn UI for components and React Query for data fetching.

### Key Frontend Features

#### Rich Text Editor

The rich text editor component (`client/src/components/ui/rich-text-editor.tsx`) provides text formatting and image embedding capabilities:

```typescript
// Rich Text Editor - Key functionality
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
  
  // Handle input changes
  const handleInput = () => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    onChange(content);
    setCharacters(countCharacters(content));
  };
  
  // Execute command function for formatting
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };
  
  // Handle image upload
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
        {/* Formatting buttons */}
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
    </div>
  );
};
```

#### Note Preview Modal

The fullscreen preview dialog (`client/src/components/modals/fullscreen-preview-dialog.tsx`) displays note content with zooming capabilities:

```typescript
const FullscreenPreviewDialog = ({ 
  open, 
  onClose, 
  title, 
  content 
}: FullscreenPreviewDialogProps) => {
  const [zoomLevel, setZoomLevel] = useState(100);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] h-[90vh] w-full flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {/* Zoom controls */}
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-card rounded-lg shadow-md border border-border/50 my-4" style={{ zoom: `${zoomLevel}%` }}>
          <div 
            className="prose dark:prose-invert max-w-none break-words text-foreground whitespace-pre-wrap min-h-full"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

#### Categories and Notes Pages

The main application pages for viewing categories and notes are implemented in:
- `client/src/pages/categories.tsx`
- `client/src/pages/notes.tsx`

## Key Features

### 1. Rich Text Editing

The application includes a powerful rich text editor with:
- Text formatting options (bold, italic, underline)
- Lists (ordered and unordered)
- Text alignment
- Highlighting
- Font size adjustment
- Image embedding (using base64 encoding)

### 2. Category Management

Users can organize notes into categories with:
- Custom icons
- Custom colors
- Custom gradients
- Category editing and deletion

### 3. Note Management

Notes can be:
- Created within categories
- Edited with rich text formatting
- Pinned for quick access
- Marked as favorites
- Viewed in a fullscreen preview mode with zoom controls

### 4. Image Support

Images can be:
- Uploaded and embedded directly in notes
- Stored using base64 encoding (no server-side storage required)
- Displayed in both edit and preview modes

## Database Schema

The database schema is defined in `shared/schema.ts` and includes:

### Users Table
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Categories Table
```typescript
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  customImage: text("custom_image"),
  gradient: text("gradient"),
  imageType: text("image_type"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Notes Table
```typescript
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

## Setting Up Locally

Follow these steps to set up the application on your local environment:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd madani-notes
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   - Create a PostgreSQL database
   - Set the `DATABASE_URL` environment variable pointing to your database
   - Run migrations: `npm run db:push`
   - Seed initial data: `npm run db:seed`

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Open your browser and navigate to `http://localhost:5000`

## Project Configuration Files

### package.json
```json
{
  "name": "madani-notes",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch --inspect server/index.ts",
    "build": "vite build && esbuild server/index.ts --bundle --platform=node --outfile=dist/server.js",
    "start": "node dist/server.js",
    "lint": "eslint . --max-warnings 0",
    "db:push": "drizzle-kit push:pg",
    "db:seed": "tsx db/seed.ts",
    "db:studio": "drizzle-kit studio"
  }
}
```

### vite.config.ts
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { themePlugin } from "@replit/vite-plugin-shadcn-theme-json";

export default defineConfig({
  plugins: [react(), themePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@db": path.resolve(__dirname, "./db"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
```

### drizzle.config.ts
```typescript
import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default {
  schema: "./shared/schema.ts",
  out: "./db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL ?? "",
  },
} satisfies Config;
```

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import { shadcnPlugin } from "./client/src/lib/shadcn-plugin";

const config = {
  darkMode: ["class"],
  content: ["./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
      // Other theme extensions...
    },
  },
  plugins: [shadcnPlugin, require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
```

---

This documentation covers the key aspects of the Madani Notes application implementation. For further details on specific components or functionality, refer to the source code in the respective files.