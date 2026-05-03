# Blink Scroll Homepage

This version uses the Sketchfab iPhone 17 Pro model requested by the user.

## What changed

- Replaced the failed custom React Three Fiber phone render with an embedded Sketchfab model.
- Uses the Sketchfab Viewer API to initialize the model and control the camera.
- Scroll updates now orbit the camera around the model so the iPhone rotates visually on the Y axis.
- The phone remains centered in the sticky hero section.
- A loading state and error state are included so the screen does not just appear black.

## Model used

Sketchfab model UID:
`4aeeeb41f9d14f96bb3f2589edc3edac`

## Run locally

```bash
npm install
npm run dev
```

## Notes

This version requires internet access because the Sketchfab viewer script and the model are loaded from Sketchfab.
# blink-scroll-homepage
