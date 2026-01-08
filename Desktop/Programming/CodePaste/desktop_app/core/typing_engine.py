"""
Stealth Typing Engine - Uses WM_CHAR direct window messaging
to bypass kernel-level keyboard hooks.
"""

import time
import ctypes
import random
from ctypes import wintypes
from typing import Callable, Optional

# Windows API constants
WM_CHAR = 0x0102
WM_KEYDOWN = 0x0100
WM_KEYUP = 0x0101
VK_RETURN = 0x0D
VK_TAB = 0x09
VK_DELETE = 0x2E

# Load DLLs
user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32

# Define function signatures
user32.GetForegroundWindow.restype = wintypes.HWND
user32.PostMessageW.argtypes = [wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM]
user32.PostMessageW.restype = wintypes.BOOL
user32.GetWindowThreadProcessId.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.DWORD)]
user32.GetWindowThreadProcessId.restype = wintypes.DWORD
user32.AttachThreadInput.argtypes = [wintypes.DWORD, wintypes.DWORD, wintypes.BOOL]
user32.AttachThreadInput.restype = wintypes.BOOL
user32.GetFocus.restype = wintypes.HWND


class TypingEngine:
    """Stealth typing engine using direct window messages"""
    
    def __init__(self):
        self.is_typing = False
        self.should_stop = False
        self.base_delay = 0.040  # 40ms base delay
        self.delete_duration = 3.0  # Delete key spam duration
        
        # Callbacks
        self.on_progress: Optional[Callable[[int, int], None]] = None
        self.on_complete: Optional[Callable[[int], None]] = None
        self.on_error: Optional[Callable[[str], None]] = None
    
    def get_focused_control(self) -> Optional[int]:
        """Get the handle of the currently focused control"""
        hwnd = user32.GetForegroundWindow()
        if not hwnd:
            return None
        
        remote_thread = user32.GetWindowThreadProcessId(hwnd, None)
        current_thread = kernel32.GetCurrentThreadId()
        
        if remote_thread != current_thread:
            user32.AttachThreadInput(current_thread, remote_thread, True)
        
        focused = user32.GetFocus()
        
        if remote_thread != current_thread:
            user32.AttachThreadInput(current_thread, remote_thread, False)
        
        return focused if focused else hwnd
    
    def send_char(self, hwnd: int, char: str) -> bool:
        """Send a character via WM_CHAR"""
        result = user32.PostMessageW(hwnd, WM_CHAR, ord(char), 0)
        return result != 0
    
    def send_key(self, hwnd: int, vk_code: int):
        """Send a virtual key via WM_KEYDOWN/WM_KEYUP"""
        scan_code = user32.MapVirtualKeyW(vk_code, 0)
        lparam_down = 1 | (scan_code << 16)
        lparam_up = 1 | (scan_code << 16) | (1 << 30) | (1 << 31)
        
        user32.PostMessageW(hwnd, WM_KEYDOWN, vk_code, lparam_down)
        time.sleep(0.001)
        user32.PostMessageW(hwnd, WM_KEYUP, vk_code, lparam_up)
    
    def random_delay(self) -> float:
        """Generate human-like random delay"""
        variation = random.uniform(-0.010, 0.025)
        if random.random() < 0.05:
            variation += random.uniform(0.08, 0.20)
        return max(0.020, self.base_delay + variation)
    
    def spam_delete(self, hwnd: int, duration: float = 3.0):
        """Rapidly press Delete key"""
        start_time = time.time()
        while (time.time() - start_time) < duration and not self.should_stop:
            self.send_key(hwnd, VK_DELETE)
            time.sleep(0.05)
    
    def type_text(self, text: str, spam_delete_after: bool = True) -> int:
        """
        Type text using stealth method.
        Returns number of characters successfully typed.
        """
        if self.is_typing:
            if self.on_error:
                self.on_error("Already typing in progress")
            return 0
        
        self.is_typing = True
        self.should_stop = False
        
        try:
            # Small delay to ensure focus
            time.sleep(0.3)
            
            hwnd = self.get_focused_control()
            if not hwnd:
                if self.on_error:
                    self.on_error("Could not find focused window")
                return 0
            
            success_count = 0
            total = len(text)
            
            for i, char in enumerate(text):
                if self.should_stop:
                    break
                    
                if char == '\r':
                    continue
                elif char == '\n':
                    self.send_key(hwnd, VK_RETURN)
                    time.sleep(0.02)
                elif char == '\t':
                    self.send_key(hwnd, VK_TAB)
                    time.sleep(0.01)
                else:
                    if self.send_char(hwnd, char):
                        success_count += 1
                    time.sleep(self.random_delay())
                
                # Progress callback every 50 chars
                if self.on_progress and (i + 1) % 50 == 0:
                    self.on_progress(i + 1, total)
            
            # Final progress update
            if self.on_progress:
                self.on_progress(total, total)
            
            # Spam delete after typing
            if spam_delete_after and not self.should_stop:
                time.sleep(0.2)
                self.spam_delete(hwnd, self.delete_duration)
            
            if self.on_complete:
                self.on_complete(success_count)
            
            return success_count
            
        except Exception as e:
            if self.on_error:
                self.on_error(str(e))
            return 0
        finally:
            self.is_typing = False
    
    def stop(self):
        """Stop current typing operation"""
        self.should_stop = True
    
    def set_speed(self, delay_ms: int):
        """Set typing speed (delay between characters in milliseconds)"""
        self.base_delay = delay_ms / 1000.0
    
    def set_delete_duration(self, seconds: float):
        """Set delete spam duration"""
        self.delete_duration = seconds


# Global engine instance
typing_engine = TypingEngine()
