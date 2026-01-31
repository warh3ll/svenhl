

## Plan: Integrate Hotjar for Visitor Feedback

### Overview
Hotjar is a behavior analytics tool that provides heatmaps, session recordings, and - importantly for your use case - **feedback widgets** that allow visitors to leave feedback directly on your site. We'll integrate the Hotjar tracking script and enable the feedback functionality.

### What You'll Get
- **Feedback Widget**: A button visitors can click to leave feedback (ratings, comments)
- **Session Recordings**: See how visitors interact with your site
- **Heatmaps**: Visual data on where users click and scroll

### Prerequisites
You'll need a Hotjar account and Site ID:
1. Sign up at [hotjar.com](https://www.hotjar.com) (free tier available)
2. Create a new site in your Hotjar dashboard
3. Copy your **Site ID** (a numeric ID like `1234567`)

### Implementation

**File: `index.html`**

Add the Hotjar tracking script in the `<head>` section:

```html
<!-- Hotjar Tracking Code -->
<script>
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:YOUR_HOTJAR_SITE_ID,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

### Important Note About API Keys

Since the Hotjar Site ID is a **publishable identifier** (similar to Google Analytics tracking IDs), it's safe to include directly in the codebase. It's not a secret key - it's designed to be public-facing in your website's source code.

### Files to Modify

| File | Change |
|------|--------|
| `index.html` | Add Hotjar tracking script with your Site ID |

### After Integration

Once integrated:
1. Log into your Hotjar dashboard
2. Go to **Feedback** → **Incoming Feedback** to enable the feedback widget
3. Customize the widget's appearance, position, and questions
4. The feedback button will automatically appear on your site

### Technical Details
- Script loads asynchronously (won't block page rendering)
- Works with your existing SPA routing (React Router)
- No additional React components needed - Hotjar handles everything via their dashboard

