import cv2
import os
import glob

class CropTool:
    def __init__(self, image_path):
        # Read image and ensure it's in BGR format
        self.image = cv2.imread(image_path, cv2.IMREAD_COLOR)
        if self.image is None:
            raise ValueError(f"Could not load image: {image_path}")
            
        self.window_name = f"Crop Tool - {os.path.basename(image_path)}"
        # Set rectangle size to the largest square that can fit in the image
        self.rect_size = min(self.image.shape[0], self.image.shape[1])
        # Center the square initially
        self.x = (self.image.shape[1] - self.rect_size) // 2
        self.y = (self.image.shape[0] - self.rect_size) // 2
        self.output_path = image_path.replace('.png', '_cropped.png')
        self.dragging = False
        self.offset_x = 0
        self.offset_y = 0
        
    def mouse_callback(self, event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            # Check if click is within the rectangle
            if (self.x <= x <= self.x + self.rect_size and 
                self.y <= y <= self.y + self.rect_size):
                self.dragging = True
                self.offset_x = x - self.x
                self.offset_y = y - self.y
        elif event == cv2.EVENT_MOUSEMOVE and self.dragging:
            # Update rectangle position while dragging
            new_x = x - self.offset_x
            new_y = y - self.offset_y
            # Keep rectangle within image bounds
            self.x = max(0, min(new_x, self.image.shape[1] - self.rect_size))
            self.y = max(0, min(new_y, self.image.shape[0] - self.rect_size))
        elif event == cv2.EVENT_LBUTTONUP:
            self.dragging = False
        
    def draw_rect(self, img):
        img_copy = img.copy()
        cv2.rectangle(img_copy, 
                     (self.x, self.y), 
                     (self.x + self.rect_size, self.y + self.rect_size), 
                     (0, 255, 0), 2)
        # Add instructions
        cv2.putText(img_copy, "SPACE: crop and next | ESC: skip | q: quit", 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        return img_copy
    
    def run(self):
        cv2.namedWindow(self.window_name)
        cv2.setMouseCallback(self.window_name, self.mouse_callback)
        
        while True:
            img_with_rect = self.draw_rect(self.image)
            cv2.imshow(self.window_name, img_with_rect)
            key = cv2.waitKey(1) & 0xFF
            
            # Movement controls (arrow keys or WASD) for fine-tuning
            if key == 82 or key == ord('w'):  # Up
                self.y = max(0, self.y - 1)
            elif key == 84 or key == ord('s'):  # Down
                self.y = min(self.image.shape[0] - self.rect_size, self.y + 1)
            elif key == 81 or key == ord('a'):  # Left
                self.x = max(0, self.x - 1)
            elif key == 83 or key == ord('d'):  # Right
                self.x = min(self.image.shape[1] - self.rect_size, self.x + 1)
            elif key == 32:  # SPACE to crop and continue
                cropped = self.image[self.y:self.y + self.rect_size, 
                                   self.x:self.x + self.rect_size].copy()
                # Ensure we're writing a clean BGR image
                cv2.imwrite(self.output_path, cropped, [cv2.IMWRITE_PNG_COMPRESSION, 9])
                print(f"Saved cropped image to: {self.output_path}")
                break
            elif key == 27:  # ESC to skip
                print(f"Skipped: {self.window_name}")
                break
            elif key == ord('q'):  # q to quit entirely
                cv2.destroyAllWindows()
                return False
                
        cv2.destroyAllWindows()
        return True

def main():
    # Get all PNG files in the current directory that aren't already cropped
    image_files = [f for f in glob.glob("*.png") if not f.endswith('_cropped.png')]
    
    if not image_files:
        print("No PNG files found in the current directory!")
        return

    print(f"\nFound {len(image_files)} images. Starting crop tool...")
    print("Controls:")
    print("- Drag square with mouse")
    print("- Arrow keys/WASD for fine adjustments")
    print("- SPACE: crop current image and move to next")
    print("- ESC: skip current image")
    print("- q: quit program\n")
    
    for img_path in sorted(image_files):
        try:
            cropper = CropTool(img_path)
            if not cropper.run():  # If user pressed 'q'
                print("\nQuitting...")
                break
        except Exception as e:
            print(f"Error processing {img_path}: {str(e)}")
            continue

if __name__ == "__main__":
    main() 