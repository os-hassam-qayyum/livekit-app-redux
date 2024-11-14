# Flow Chart for Screen Share (Single / Multiple)

# Screen Share Functionality Flow

1. _Participant Starts Screen Share_

   - The participant initiates screen sharing.
   - The application checks the current screen layout.

2. _Add Screen to Grid Layout_

   - If there are multiple shared screens, add the new screen to a grid layout.
   - Adjust the layout to accommodate multiple screens, ensuring all screens fit within the grid.

3. _Display Expand Button on Each Screen_

   - An "Expand" button is shown on each screen to allow users to focus on a particular screen.

4. _User Clicks Expand on a Screen_

   - When the "Expand" button is clicked:
     - The selected screen moves to the right side of the view in expanded mode.
     - Other shared screens are resized and displayed in a smaller grid on the left side.

5. _User Clicks Unexpand on the Expanded Screen_

   - When the "Unexpand" button is clicked on the expanded screen:
     - The expanded screen returns to its previous position within the grid layout.

6. _Adjust Grid Layout for Multiple Screens_

   - As screens are added or removed, the layout dynamically adjusts to display all shared screens in the grid.
   - Ensure that the grid layout remains consistent as screens are expanded or unexpanded.

7. _Participant Stops Screen Sharing_

   - When a participant stops sharing, the screen is removed from the grid.
   - The grid layout updates automatically to reflect the remaining shared screens.

8. _Return to Default Layout When No Screens are Shared_
   - If there are no remote screens or no local screens currently being shared:
     - Count the number of all remote screens and local screens (remoteScreenShareCount and localScreenShareCount) which are shared.
     - If remoteScreenShareCount is 0, then it should return to its default layout.
     - The application returns to the previous grid layout used before any screen sharing began.
     - This ensures that the layout reverts to its default state without screen-sharing elements, maintaining a consistent user experience.

This flow allows multiple participants to share screens, each with an expand/unexpand feature, and maintains a dynamic grid layout to ensure a flexible, organized view of all screens. When no screens are shared, the layout seamlessly returns to the default view.
