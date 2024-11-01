# Implementing Picture-in-Picture (PiP) Overlay in LiveKit

This documentation describes how to implement a Picture-in-Picture (PiP) overlay for LiveKit applications inspired by Google Meet’s PiP feature. With this functionality, a user can view a minimized, always-on-top video overlay of an active participant or their own video feed even while interacting with other windows or applications.

---

## Objective

The PiP overlay provides a video preview that remains accessible when the user minimizes the main LiveKit window or switches between applications. This guide covers the steps to create a responsive, interactive overlay with customizable options for managing layout, view mode, and user interaction.

## Key Features

1. **Minimized Overlay Video Feed**: A draggable, resizable video feed window that remains visible during multitasking.
2. **UI Controls**: Control icons for toggling between minimized and expanded view, closing PiP, and mute options.
3. **Auto-activation**: Auto-launch PiP when the main window loses focus, or the user minimizes the window.

---

## Step-by-Step Implementation

### Step 1: Set Up Overlay Detection and Toggle Mechanism

1. **Focus Detection**: Set up event listeners to detect when the user minimizes the main app window or switches away from it.
2. **PiP State Management**: Track the overlay's active state to determine whether it should appear or disappear based on user activity.

### Step 2: Design Overlay UI Structure

1. **Create a Minimal PiP Component**: Structure the PiP overlay component with HTML for a video element and toolbar with UI controls.
2. **UI Controls**:
   - **Expand/Minimize**: Toggle the overlay between compact and expanded modes.
   - **Close**: Exit the PiP overlay view.
   - **Mute/Unmute**: Allow users to mute audio directly from the overlay.
3. **Overlay Styling**: Style the overlay with CSS for rounded corners, background dimming, and responsiveness to screen size.

### Step 3: Display and Control the Video Stream in PiP

1. **Video Stream Attachment**: Use LiveKit’s video stream API to link the active participant's video to the PiP overlay’s video element.
2. **Dynamic Stream Switching**: Allow users to switch between self-view and other participant feeds in the overlay.

### Step 4: Manage Overlay Behavior with Angular Services or Redux

1. **Application State**: Store the PiP overlay’s state (visible, minimized, or expanded) in the application state for easy access and control.
2. **Dispatch Actions for PiP**: Create actions to handle PiP activation, deactivation, resizing, and closing. These actions help in controlling the overlay based on user interaction or app state changes.

### Step 5: Implement Drag-and-Resize Functionality

1. **Draggable Overlay**: Use a drag-and-drop library or custom directives to enable moving the PiP overlay anywhere on the screen.
2. **Resizable Overlay**: Allow resizing with preset dimensions or custom drag handles to provide flexible viewing sizes.

### Step 6: Conditionally Render PiP Based on Focus

1. **Auto-activation**: Activate the PiP overlay automatically when the app detects that the main window loses focus.
2. **Deactivation**: Automatically close or minimize PiP when the main window regains focus or upon user request.

### Step 7: Test and Optimize the Overlay

1. **Cross-Browser Compatibility**: Test the PiP overlay on major browsers to ensure consistent functionality and appearance.
2. **Performance Tuning**: Ensure the PiP overlay doesn’t impact overall app performance and adjusts smoothly with user actions.

---

## Optional Enhancements

1. **PiP Customization**: Allow users to set PiP defaults, such as size, position, or participant preference.
2. **Multi-stream Support**: Enable multiple PiP overlays to allow simultaneous viewing of multiple participants.
3. **Additional PiP Controls**: Add options like “Add Participant” or “Switch Participant” for enhanced user interaction.

---

## Conclusion

Following these steps will create a streamlined, user-friendly PiP overlay similar to Google Meet’s feature. This enhancement improves multitasking, ensuring users maintain visual contact even when they navigate away from the primary LiveKit application window.
