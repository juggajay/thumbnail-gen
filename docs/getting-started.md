# Getting Started - Your First Thumbnail in 10 Minutes

## What This Tool Does (Simple Version)

Think of it like a **thumbnail factory**:

1. You design a **template** (the "mold") - where text goes, what colors, what background
2. You feed it **data** (title, mood, etc.)
3. It spits out a **thumbnail** matching your design

Once your template is set up, your AI pipeline just sends data and gets thumbnails automatically.

---

## The 5-Minute Walkthrough

### Step 1: Open the App

Go to: **http://localhost:5174**

You'll see a dark interface with:
- **Left sidebar**: Your templates (probably empty)
- **Top tabs**: Editor, Assets, Outputs, Settings

---

### Step 2: Create Your First Template

1. Look at the **left sidebar**
2. Click the **"+ New"** button
3. A dialog appears - enter:
   - **Name**: `keeper-test` (or whatever you want)
   - **Pipeline**: `youtube-stories` (this is just a label)
4. Click **Create**

You now have a blank template selected.

---

### Step 3: Upload a Background Image

Before we configure the template, let's add an image to use:

1. Click the **"Assets"** tab at the top
2. You'll see sections: Backgrounds, Fonts, Keeper Expressions
3. In the **Backgrounds** section, drag and drop any image (or click to browse)
4. Wait for it to upload

---

### Step 4: Configure Your Template

1. Click **"Editor"** tab to go back
2. Make sure your template is selected in the left sidebar
3. Look at the **right panel** - you'll see two tabs: **Background** and **Zones**

**Set the Background:**
1. Click **"Background"** tab (should already be selected)
2. Click **"Fixed Images"** button (not AI Generated - let's start simple)
3. Under "Background Images", click on the image you uploaded to select it
4. It should get a cyan checkmark

**Add Text Zone:**
1. Click **"Zones"** tab
2. Click **"+ Add Zone"** button
3. A "headline" zone appears
4. You can adjust:
   - **Font**: What font to use (default: Impact)
   - **Max Size**: How big the text can be (default: 96)
   - **Color**: Click the color box to change
   - **Stroke**: Outline thickness (default: 4)

---

### Step 5: Test It

1. Look at the **bottom of the screen** - you'll see "Test Data" inputs
2. You should see a field for **headline** - type something like: `THE WHISPERING WALLS`
3. Click the **"Preview"** button

The canvas in the center should show your thumbnail with:
- Your background image
- Your text overlaid on it

---

### Step 6: Generate Your First Real Thumbnail

1. In the Test Data section, enter:
   - **Episode ID**: `EP-001`
   - **headline**: `THE HOUSE THAT WATCHED`
2. Click **"Generate"** button
3. Wait a few seconds

Your thumbnail is now saved! Check:
- Click **"Outputs"** tab at the top
- You'll see your generated thumbnail
- Click to download it

---

## Understanding the Key Concepts

### Templates = Your Design Recipe

A template defines:
- **Canvas size**: Always 1280x720 (YouTube standard)
- **Background**: Fixed image OR AI-generated
- **Zones**: Where text/images go and how they look

You'll probably have 1-2 templates per channel.

### Background Modes

| Mode | When to Use |
|------|-------------|
| **Fixed Images** | You have specific images (like your host photos for Cybersecurity) |
| **AI Generated** | You want unique backgrounds per episode (like The Keeper stories) |

For starting out, use **Fixed Images** - it's simpler.

### Zones = Text/Image Slots

Each zone is a "slot" where content goes:
- **Text zone**: For titles, headlines
- Position is defined by X, Y, Width, Height
- **Auto-sizing**: Text shrinks to fit if it's too long

### Text Formatting Options

Click on a zone to expand it and see all formatting options:

| Category | Options |
|----------|---------|
| **Position & Size** | X, Y, Width, Height - control where the zone sits on the canvas |
| **Typography** | Font, Max Size, Letter Spacing (dramatic wide spacing), Transform (UPPERCASE/lowercase) |
| **Layout** | Rotation (vertical text!), Horizontal Align, Vertical Align |
| **Colors & Effects** | Text Color, Stroke Color, Stroke Width |
| **Text Background** | Optional colored bar behind text for readability |

#### Creating Vertical Text (Left Side)

For dramatic vertical text along the left edge:

1. **Position**: X: `20`, Y: `100`, Width: `100`, Height: `520`
2. **Layout**: Rotation → **-90° (Vertical Left)**
3. **Typography**: Letter Spacing → `10` (for dramatic spacing)
4. **Transform**: **UPPERCASE**

This creates text reading from bottom-to-top along the left edge - great for horror thumbnails!

### The Data You Send

When generating, you provide data like:
```
headline: "CRITICAL EXCHANGE VULNERABILITY"
severity: "CRITICAL"
```

The template uses this data to:
- Fill in text zones
- Pick colors (CRITICAL = red, HIGH = orange)
- Build AI prompts (if using AI backgrounds)

---

## Quick Reference: What Each Button Does

| Button | What It Does |
|--------|--------------|
| **+ New** (sidebar) | Create a new template |
| **Duplicate** | Copy a template to experiment |
| **Delete** | Remove a template |
| **Preview** | Show what the thumbnail looks like with your test data |
| **Generate** | Actually create and save a thumbnail file |
| **Use** (on backgrounds) | Select that background for the current template |

---

## Your Workflow (Day to Day)

### When Setting Up (Once):
1. Create template
2. Upload backgrounds (or configure AI prompts)
3. Add text zones
4. Test with Preview
5. Tweak until it looks right
6. Save (automatic)

### When Creating Thumbnails (Each Episode):
1. Open app
2. Select your template
3. Enter episode data
4. Click Generate
5. Download from Outputs tab

### When Fully Automated:
Your AI pipeline calls the API directly - no UI needed:
```
POST http://localhost:8000/api/generate
{
  "template_id": "keeper-v1",
  "episode_id": "EP-042",
  "data": {
    "title": "The Whispering Walls"
  }
}
```

---

## Common Questions

**Q: Why is my preview blank?**
A: You probably don't have a background selected. Go to Background tab and select an image.

**Q: The text is too small/big**
A: Adjust "Max Size" in the zone settings. The text auto-shrinks to fit, but won't go bigger than Max Size.

**Q: How do I change text position?**
A: Currently this is set in the template JSON. For now, the default position (bottom of image) works for most thumbnails.

**Q: Where are my files saved?**
A: Everything is in the `data` folder:
- `data/templates/` - Your template configs
- `data/assets/backgrounds/` - Uploaded images
- `data/outputs/` - Generated thumbnails

**Q: Do I need to keep the terminal windows open?**
A: Yes! The backend must be running for the app to work. If you close them, run `start.bat` again.

---

## Next Steps

1. **Create a template for each channel** (Cybersecurity + The Keeper)
2. **Test with a few episodes** to make sure you like the look
3. **Give the integration guide to your AI dev** (`docs/integration-guide-keeper.md`)
4. **Set up automation** - your AI dev can call the API directly

---

## Cheat Sheet

```
START THE APP:
  Double-click start.bat (or run it in terminal)
  Open http://localhost:5174

CREATE THUMBNAIL (MANUAL):
  1. Select template (left sidebar)
  2. Enter data (bottom panel)
  3. Click Generate
  4. Download from Outputs tab

CREATE THUMBNAIL (API):
  POST http://localhost:8000/api/generate
  Body: { "template_id": "...", "episode_id": "...", "data": {...} }

FILES:
  Templates: data/templates/
  Backgrounds: data/assets/backgrounds/
  Outputs: data/outputs/
```
