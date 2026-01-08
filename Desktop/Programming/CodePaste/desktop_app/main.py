"""
AutoTyper Desktop Application
Modern UI with PyQt6
"""

import sys
import os
import threading

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QLineEdit, QPushButton, QFrame, QProgressBar, QMessageBox,
    QGraphicsDropShadowEffect
)
from PyQt6.QtCore import Qt, QTimer, pyqtSignal, QObject
from PyQt6.QtGui import QFont, QColor, QIcon

import pyperclip
import keyboard

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.api_client import api_client
from core.typing_engine import typing_engine


# Modern dark theme stylesheet - Violet palette
DARK_STYLE = """
QWidget {
    background-color: #0f0f1a;
    color: #eaeaea;
    font-family: 'Segoe UI', Arial, sans-serif;
}

QMainWindow {
    background-color: #0f0f1a;
}

QLabel {
    background: transparent;
    color: #eaeaea;
}

QLineEdit {
    background-color: #1a1a2e;
    border: 2px solid #2d2d44;
    border-radius: 8px;
    padding: 12px 15px;
    font-size: 14px;
    color: #eaeaea;
}

QLineEdit:focus {
    border: 2px solid #8b5cf6;
}

QLineEdit::placeholder {
    color: #6c757d;
}

QPushButton {
    background-color: #8b5cf6;
    border: none;
    border-radius: 6px;
    padding: 8px 14px;
    font-size: 11px;
    font-weight: bold;
    color: white;
}

QPushButton:hover {
    background-color: #a78bfa;
}

QPushButton:pressed {
    background-color: #7c3aed;
}

QPushButton:disabled {
    background-color: #3d3d5c;
    color: #6a6a8a;
}

QPushButton#secondaryBtn {
    background-color: transparent;
    border: 2px solid #8b5cf6;
    color: #8b5cf6;
}

QPushButton#secondaryBtn:hover {
    background-color: #8b5cf6;
    color: white;
}

QFrame#card {
    background-color: #1a1a2e;
    border-radius: 15px;
    border: 1px solid #2d2d44;
}

QProgressBar {
    background-color: #2d2d44;
    border-radius: 5px;
    height: 10px;
    text-align: center;
}

QProgressBar::chunk {
    background-color: #8b5cf6;
    border-radius: 5px;
}
"""


class SignalEmitter(QObject):
    """Helper class for thread-safe signal emission"""
    update_signal = pyqtSignal(str, str)  # status, color
    progress_signal = pyqtSignal(int)
    complete_signal = pyqtSignal(int)
    credits_signal = pyqtSignal(int)
    auth_result_signal = pyqtSignal(dict, str)


class LoginWindow(QMainWindow):
    """Modern Login/Signup Window"""
    
    def __init__(self, on_login_success):
        super().__init__()
        self.on_login_success = on_login_success
        self.signals = SignalEmitter()
        self.signals.auth_result_signal.connect(self.handle_auth_result)
        
        self.setWindowTitle("CodePaste - Login")
        self.setFixedSize(450, 580)
        self.setStyleSheet(DARK_STYLE)
        
        self.setup_ui()
        self.center_window()
    
    def center_window(self):
        screen = QApplication.primaryScreen().geometry()
        x = (screen.width() - self.width()) // 2
        y = (screen.height() - self.height()) // 2
        self.move(x, y)
    
    def setup_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.setSpacing(0)
        
        # Logo
        title = QLabel("CodePaste")
        title.setFont(QFont("Segoe UI", 28, QFont.Weight.Bold))
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)
        
        subtitle = QLabel("Stealth Code Auto-Typer")
        subtitle.setFont(QFont("Segoe UI", 12))
        subtitle.setStyleSheet("color: #8a8a9a;")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(subtitle)
        
        layout.addSpacing(30)
        
        # Form card
        card = QFrame()
        card.setObjectName("card")
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(25, 25, 25, 25)
        card_layout.setSpacing(15)
        
        # Email
        email_label = QLabel("Email")
        email_label.setFont(QFont("Segoe UI", 11))
        card_layout.addWidget(email_label)
        
        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("Enter your email")
        self.email_input.setMinimumHeight(48)
        card_layout.addWidget(self.email_input)
        
        # Password
        pass_label = QLabel("Password")
        pass_label.setFont(QFont("Segoe UI", 11))
        card_layout.addWidget(pass_label)
        
        self.pass_input = QLineEdit()
        self.pass_input.setPlaceholderText("Enter your password")
        self.pass_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.pass_input.setMinimumHeight(48)
        self.pass_input.returnPressed.connect(self.do_login)
        card_layout.addWidget(self.pass_input)
        
        card_layout.addSpacing(10)
        
        # Login button
        self.login_btn = QPushButton("Login")
        self.login_btn.setMinimumHeight(48)
        self.login_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.login_btn.clicked.connect(self.do_login)
        card_layout.addWidget(self.login_btn)
        
        # Signup button
        self.signup_btn = QPushButton("Create Account")
        self.signup_btn.setObjectName("secondaryBtn")
        self.signup_btn.setMinimumHeight(48)
        self.signup_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.signup_btn.clicked.connect(self.do_signup)
        card_layout.addWidget(self.signup_btn)
        
        layout.addWidget(card)
        
        layout.addStretch()
        
        # Status
        self.status_label = QLabel("")
        self.status_label.setFont(QFont("Segoe UI", 11))
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.status_label)
    
    def set_status(self, text, color="#8a8a9a"):
        self.status_label.setText(text)
        self.status_label.setStyleSheet(f"color: {color};")
    
    def set_buttons_enabled(self, enabled):
        self.login_btn.setEnabled(enabled)
        self.signup_btn.setEnabled(enabled)
    
    def do_login(self):
        email = self.email_input.text().strip()
        password = self.pass_input.text()
        
        if not email or not password:
            self.set_status("Please enter email and password", "#ff6b6b")
            return
        
        self.set_buttons_enabled(False)
        self.set_status("Logging in...", "#4dabf7")
        
        def login_thread():
            result = api_client.login(email, password)
            self.signals.auth_result_signal.emit(result, "login")
        
        threading.Thread(target=login_thread, daemon=True).start()
    
    def do_signup(self):
        email = self.email_input.text().strip()
        password = self.pass_input.text()
        
        if not email or not password:
            self.set_status("Please enter email and password", "#ff6b6b")
            return
        
        if len(password) < 6:
            self.set_status("Password must be at least 6 characters", "#ff6b6b")
            return
        
        self.set_buttons_enabled(False)
        self.set_status("Creating account...", "#4dabf7")
        
        def signup_thread():
            result = api_client.signup(email, password)
            self.signals.auth_result_signal.emit(result, "signup")
        
        threading.Thread(target=signup_thread, daemon=True).start()
    
    def handle_auth_result(self, result, action):
        self.set_buttons_enabled(True)
        if result["success"]:
            if action == "signup":
                self.set_status("Account created! 2000 free credits added.", "#51cf66")
            else:
                self.set_status("Login successful!", "#51cf66")
            QTimer.singleShot(800, self.login_success)
        else:
            self.set_status(result["error"], "#ff6b6b")
    
    def login_success(self):
        self.close()
        self.on_login_success()


class MainWindow(QMainWindow):
    """Main Dashboard Window"""
    
    def __init__(self):
        super().__init__()
        self.signals = SignalEmitter()
        self.signals.update_signal.connect(self.update_status)
        self.signals.progress_signal.connect(self.update_progress)
        self.signals.complete_signal.connect(self.typing_complete)
        self.signals.credits_signal.connect(self.update_credits)
        
        self.setWindowTitle("CodePaste")
        self.setFixedSize(480, 580)
        self.setStyleSheet(DARK_STYLE)
        
        self.hotkey = "alt+v"
        self.hotkey_registered = False
        
        self.setup_ui()
        self.center_window()
        self.setup_typing_callbacks()
    
    def center_window(self):
        screen = QApplication.primaryScreen().geometry()
        x = (screen.width() - self.width()) // 2
        y = (screen.height() - self.height()) // 2
        self.move(x, y)
    
    def setup_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(12)
        
        # Header
        header = QHBoxLayout()
        header.setSpacing(10)
        
        title = QLabel("CodePaste")
        title.setFont(QFont("Segoe UI", 18, QFont.Weight.Bold))
        header.addWidget(title)
        
        header.addStretch()
        
        user_label = QLabel(api_client.email)
        user_label.setFont(QFont("Segoe UI", 10))
        user_label.setStyleSheet("color: #8a8a9a;")
        header.addWidget(user_label)
        
        logout_btn = QPushButton("Logout")
        logout_btn.setObjectName("secondaryBtn")
        logout_btn.setFont(QFont("Segoe UI", 8))
        logout_btn.setMinimumWidth(70)
        logout_btn.setMinimumHeight(32)
        logout_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        logout_btn.clicked.connect(self.logout)
        header.addWidget(logout_btn)
        
        layout.addLayout(header)
        
        # Credits card
        credits_card = QFrame()
        credits_card.setObjectName("card")
        credits_layout = QVBoxLayout(credits_card)
        credits_layout.setContentsMargins(20, 20, 20, 20)
        credits_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        credits_title = QLabel("Available Credits")
        credits_title.setFont(QFont("Segoe UI", 11))
        credits_title.setStyleSheet("color: #8a8a9a;")
        credits_title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        credits_layout.addWidget(credits_title)
        
        self.credits_label = QLabel(str(api_client.credits))
        self.credits_label.setFont(QFont("Segoe UI", 28, QFont.Weight.Bold))
        self.credits_label.setStyleSheet("color: #8b5cf6;")
        self.credits_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        credits_layout.addWidget(self.credits_label)
        
        chars_label = QLabel("characters remaining")
        chars_label.setFont(QFont("Segoe UI", 10))
        chars_label.setStyleSheet("color: #8a8a9a;")
        chars_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        credits_layout.addWidget(chars_label)
        
        # Refresh and Buy Credits buttons
        credits_btn_layout = QHBoxLayout()
        credits_btn_layout.setSpacing(10)
        
        refresh_btn = QPushButton("Refresh")
        refresh_btn.setObjectName("secondaryBtn")
        refresh_btn.setFont(QFont("Segoe UI", 9))
        refresh_btn.setMinimumHeight(34)
        refresh_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        refresh_btn.clicked.connect(self.refresh_credits)
        credits_btn_layout.addWidget(refresh_btn)
        
        buy_btn = QPushButton("Buy Credits")
        buy_btn.setFont(QFont("Segoe UI", 9))
        buy_btn.setMinimumHeight(34)
        buy_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        buy_btn.clicked.connect(self.buy_credits)
        credits_btn_layout.addWidget(buy_btn)
        
        credits_layout.addSpacing(10)
        credits_layout.addLayout(credits_btn_layout)
        
        layout.addWidget(credits_card)
        
        # Instructions card - simplified
        instr_card = QFrame()
        instr_card.setObjectName("card")
        instr_layout = QVBoxLayout(instr_card)
        instr_layout.setContentsMargins(18, 15, 18, 15)
        
        instr_title = QLabel("How to Use")
        instr_title.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        instr_layout.addWidget(instr_title)
        
        instr_layout.addSpacing(6)
        
        # Point-wise instructions
        steps = [
            "Press Start to enable the service",
            "Minimize this window", 
            "Copy your content (Ctrl+C)",
            "Paste using Alt+V"
        ]
        
        for step in steps:
            step_label = QLabel(f"  •  {step}")
            step_label.setFont(QFont("Segoe UI", 10))
            step_label.setStyleSheet("color: #b0b0b0;")
            instr_layout.addWidget(step_label)
        
        layout.addWidget(instr_card)
        
        # Status card
        status_card = QFrame()
        status_card.setObjectName("card")
        status_layout = QVBoxLayout(status_card)
        status_layout.setContentsMargins(18, 15, 18, 15)
        
        self.status_label = QLabel("Stopped")
        self.status_label.setFont(QFont("Segoe UI", 11))
        self.status_label.setStyleSheet("color: #8a8a9a;")
        status_layout.addWidget(self.status_label)
        
        status_layout.addSpacing(8)
        
        self.progress_bar = QProgressBar()
        self.progress_bar.setValue(0)
        self.progress_bar.setTextVisible(False)
        self.progress_bar.setMinimumHeight(8)
        status_layout.addWidget(self.progress_bar)
        
        layout.addWidget(status_card)
        
        # Start/Stop buttons
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(12)
        
        self.start_btn = QPushButton("Start")
        self.start_btn.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        self.start_btn.setMinimumHeight(42)
        self.start_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.start_btn.clicked.connect(self.start_service)
        btn_layout.addWidget(self.start_btn)
        
        self.stop_btn = QPushButton("Stop")
        self.stop_btn.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        self.stop_btn.setMinimumHeight(42)
        self.stop_btn.setObjectName("secondaryBtn")
        self.stop_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.stop_btn.clicked.connect(self.stop_service)
        self.stop_btn.setEnabled(False)
        btn_layout.addWidget(self.stop_btn)
        
        layout.addLayout(btn_layout)
        
        layout.addStretch()
    
    def buy_credits(self):
        """Open buy credits dialog with plan selection and QR code"""
        from PyQt6.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QLabel, 
                                     QPushButton, QMessageBox, QTextEdit, QFrame,
                                     QStackedWidget, QWidget)
        from PyQt6.QtGui import QPixmap
        from PyQt6.QtCore import Qt
        import requests
        import qrcode
        from io import BytesIO
        
        # Credit packages
        packages = [
            {"price": 10, "credits": 1000, "name": "Starter"},
            {"price": 49, "credits": 7000, "name": "Pro"},
            {"price": 99, "credits": 13000, "name": "Premium"}
        ]
        
        UPI_ID = "dharani3318s@oksbi"
        selected_package = [None]  # Use list for closure
        
        dialog = QDialog(self)
        dialog.setWindowTitle("Buy Credits")
        dialog.setFixedSize(500, 650)
        dialog.setStyleSheet(DARK_STYLE)
        
        main_layout = QVBoxLayout(dialog)
        main_layout.setContentsMargins(25, 25, 25, 25)
        main_layout.setSpacing(15)
        
        # Title
        title = QLabel("Buy Credits")
        title.setFont(QFont("Segoe UI", 18, QFont.Weight.Bold))
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(title)
        
        # Stacked widget for different stages
        stack = QStackedWidget()
        main_layout.addWidget(stack)
        
        # ===== PAGE 1: Plan Selection =====
        page1 = QWidget()
        page1_layout = QVBoxLayout(page1)
        page1_layout.setSpacing(15)
        
        select_label = QLabel("Select a plan:")
        select_label.setFont(QFont("Segoe UI", 12))
        page1_layout.addWidget(select_label)
        
        def create_plan_button(pkg):
            btn = QPushButton(f"₹{pkg['price']} - {pkg['credits']:,} Credits ({pkg['name']})")
            btn.setMinimumHeight(50)
            btn.setFont(QFont("Segoe UI", 11, QFont.Weight.Bold))
            btn.setStyleSheet("""
                QPushButton {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 8px;
                    color: white;
                }
                QPushButton:hover {
                    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
                }
            """)
            return btn
        
        plan_buttons = []
        for pkg in packages:
            btn = create_plan_button(pkg)
            btn.clicked.connect(lambda checked, p=pkg: select_plan(p))
            page1_layout.addWidget(btn)
            plan_buttons.append(btn)
        
        page1_layout.addStretch()
        
        # Already have a license key link
        has_key_btn = QPushButton("I already have a license key")
        has_key_btn.setStyleSheet("background: transparent; color: #667eea; border: none;")
        has_key_btn.clicked.connect(lambda: stack.setCurrentIndex(2))
        page1_layout.addWidget(has_key_btn)
        
        stack.addWidget(page1)
        
        # ===== PAGE 2: QR Code Display =====
        page2 = QWidget()
        page2_layout = QVBoxLayout(page2)
        page2_layout.setSpacing(10)
        
        plan_info_label = QLabel("")
        plan_info_label.setFont(QFont("Segoe UI", 14, QFont.Weight.Bold))
        plan_info_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        page2_layout.addWidget(plan_info_label)
        
        qr_label = QLabel()
        qr_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        qr_label.setMinimumSize(220, 220)
        page2_layout.addWidget(qr_label)
        
        qr_info = QLabel("Scan to pay with any UPI App")
        qr_info.setFont(QFont("Segoe UI", 10))
        qr_info.setAlignment(Qt.AlignmentFlag.AlignCenter)
        qr_info.setStyleSheet("color: #8a8a9a;")
        page2_layout.addWidget(qr_info)
        
        step_label = QLabel(
            "Steps:<br>"
            "1. Scan QR and pay (Google Pay Recommended)<br>"
            "2. Send screenshot to <a href='https://t.me/CodePastebot' style='color: #8b5cf6; text-decoration: none; font-weight: bold;'>@CodePastebot</a><br>"
            "3. Get license key and enter below"
        )
        step_label.setFont(QFont("Segoe UI", 10))
        step_label.setStyleSheet("color: #8a8a9a;")
        step_label.setOpenExternalLinks(True)
        step_label.setTextFormat(Qt.TextFormat.RichText)
        page2_layout.addWidget(step_label)
        
        # Continue to license key entry
        continue_btn = QPushButton("I've made the payment")
        continue_btn.setMinimumHeight(42)
        continue_btn.setFont(QFont("Segoe UI", 11, QFont.Weight.Bold))
        continue_btn.clicked.connect(lambda: stack.setCurrentIndex(2))
        page2_layout.addWidget(continue_btn)
        
        back_btn1 = QPushButton("← Back to plans")
        back_btn1.setStyleSheet("background: transparent; color: #667eea; border: none;")
        back_btn1.clicked.connect(lambda: stack.setCurrentIndex(0))
        page2_layout.addWidget(back_btn1)
        
        stack.addWidget(page2)
        
        # ===== PAGE 3: License Key Entry =====
        page3 = QWidget()
        page3_layout = QVBoxLayout(page3)
        page3_layout.setSpacing(12)
        
        key_label = QLabel("Enter License Key:")
        key_label.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        page3_layout.addWidget(key_label)
        
        key_input = QTextEdit()
        key_input.setPlaceholderText("Paste your license key here (CP-XXX...)")
        key_input.setMinimumHeight(80)
        key_input.setMaximumHeight(80)
        page3_layout.addWidget(key_input)
        
        status_label = QLabel("")
        status_label.setFont(QFont("Segoe UI", 10))
        status_label.setWordWrap(True)
        page3_layout.addWidget(status_label)
        
        redeem_btn = QPushButton("Validate & Redeem")
        redeem_btn.setMinimumHeight(42)
        redeem_btn.setFont(QFont("Segoe UI", 11, QFont.Weight.Bold))
        page3_layout.addWidget(redeem_btn)
        
        back_btn2 = QPushButton("← Back to plans")
        back_btn2.setStyleSheet("background: transparent; color: #667eea; border: none;")
        back_btn2.clicked.connect(lambda: stack.setCurrentIndex(0))
        page3_layout.addWidget(back_btn2)
        
        page3_layout.addStretch()
        stack.addWidget(page3)
        
        # ===== Functions =====
        def generate_upi_qr(amount):
            """Generate UPI QR code for the amount"""
            upi_url = f"upi://pay?pa={UPI_ID}&pn=CodePaste&am={amount}&cu=INR"
            qr = qrcode.QRCode(version=1, box_size=8, border=2)
            qr.add_data(upi_url)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to QPixmap
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            
            pixmap = QPixmap()
            pixmap.loadFromData(buffer.read())
            return pixmap
        
        def select_plan(pkg):
            """Called when a plan is selected"""
            selected_package[0] = pkg
            plan_info_label.setText(f"Pay ₹{pkg['price']} for {pkg['credits']:,} Credits")
            
            # Generate QR code
            qr_pixmap = generate_upi_qr(pkg['price'])
            qr_label.setPixmap(qr_pixmap.scaled(200, 200, Qt.AspectRatioMode.KeepAspectRatio))
            
            # Switch to QR page
            stack.setCurrentIndex(1)
        
        def redeem_license():
            # Get license key and remove ALL whitespace
            license_key = key_input.toPlainText().replace('\n', '').replace('\r', '').replace(' ', '').strip()
            if not license_key:
                status_label.setText("Please enter a license key")
                status_label.setStyleSheet("color: #ff6b6b;")
                return
            
            status_label.setText("Validating license key...")
            status_label.setStyleSheet("color: #fcc419;")
            redeem_btn.setEnabled(False)
            QApplication.processEvents()
            
            try:
                # Validate license key
                validate_resp = requests.post(
                    "https://payment-webhook-one.vercel.app/api/validate-license",
                    json={"license_key": license_key},
                    timeout=10
                )
                
                if validate_resp.status_code != 200:
                    error_data = validate_resp.json()
                    status_label.setText(f"Invalid: {error_data.get('error', 'Unknown error')}")
                    status_label.setStyleSheet("color: #ff6b6b;")
                    redeem_btn.setEnabled(True)
                    return
                
                data = validate_resp.json()
                
                if not data.get('valid'):
                    status_label.setText(f"Invalid: {data.get('error', 'Unknown error')}")
                    status_label.setStyleSheet("color: #ff6b6b;")
                    redeem_btn.setEnabled(True)
                    return
                
                # Show confirmation
                utr = data.get('utr')
                credits = data.get('credits')
                
                confirm = QMessageBox.question(
                    dialog,
                    "Confirm Redemption",
                    f"License Key Details:\n\n"
                    f"UTR: {utr}\n"
                    f"Credits: {credits:,}\n\n"
                    f"Redeem this license key?",
                    QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
                )
                
                if confirm == QMessageBox.StandardButton.Yes:
                    # Redeem the license
                    redeem_resp = requests.post(
                        "https://payment-webhook-one.vercel.app/api/redeem-license",
                        json={
                            "license_key": license_key,
                            "user_email": api_client.email
                        },
                        timeout=10
                    )
                    
                    redeem_data = redeem_resp.json()
                    
                    if redeem_data.get('success'):
                        status_label.setText(f"Success! {credits:,} credits added.")
                        status_label.setStyleSheet("color: #51cf66;")
                        # Refresh credits display
                        self.refresh_credits()
                        QTimer.singleShot(1500, dialog.accept)
                    else:
                        status_label.setText(f"Error: {redeem_data.get('error', 'Unknown error')}")
                        status_label.setStyleSheet("color: #ff6b6b;")
                else:
                    status_label.setText("Cancelled")
                    status_label.setStyleSheet("color: #8a8a9a;")
                    
            except Exception as e:
                status_label.setText(f"Network error: {str(e)}")
                status_label.setStyleSheet("color: #ff6b6b;")
            
            redeem_btn.setEnabled(True)
        
        redeem_btn.clicked.connect(redeem_license)
        dialog.exec()
    
    def start_service(self):
        """Start the hotkey listener service"""
        self.register_hotkey()
        self.start_btn.setEnabled(False)
        self.stop_btn.setEnabled(True)
        self.update_status("Running - Press Alt+V to paste", "#51cf66")
    
    def stop_service(self):
        """Stop the hotkey listener service"""
        self.unregister_hotkey()
        self.hotkey_registered = False
        self.start_btn.setEnabled(True)
        self.stop_btn.setEnabled(False)
        self.update_status("Stopped", "#8a8a9a")
    
    def register_hotkey(self):
        try:
            keyboard.add_hotkey(self.hotkey, self.trigger_typing)
            self.hotkey_registered = True
        except Exception as e:
            print(f"Failed to register hotkey: {e}")
    
    def unregister_hotkey(self):
        if self.hotkey_registered:
            try:
                keyboard.remove_hotkey(self.hotkey)
            except:
                pass
    
    def setup_typing_callbacks(self):
        def on_progress(current, total):
            progress = int((current / total) * 100)
            self.signals.progress_signal.emit(progress)
            self.signals.update_signal.emit(f"Typing... {current}/{total}", "#fcc419")
        
        def on_complete(count):
            self.signals.complete_signal.emit(count)
        
        def on_error(error):
            self.signals.update_signal.emit(f"Error: {error}", "#ff6b6b")
            self.signals.complete_signal.emit(0)
        
        typing_engine.on_progress = on_progress
        typing_engine.on_complete = on_complete
        typing_engine.on_error = on_error
    
    def update_status(self, text, color):
        self.status_label.setText(text)
        self.status_label.setStyleSheet(f"color: {color};")
    
    def update_progress(self, value):
        self.progress_bar.setValue(value)
    
    def update_credits(self, credits):
        self.credits_label.setText(str(credits))
    
    def typing_complete(self, count):
        self.progress_bar.setValue(100)
    
    def refresh_credits(self):
        def refresh_thread():
            result = api_client.get_balance()
            if result["success"]:
                self.signals.credits_signal.emit(api_client.credits)
                self.signals.update_signal.emit("Credits refreshed", "#51cf66")
            else:
                self.signals.update_signal.emit(f"Error: {result['error']}", "#ff6b6b")
        
        threading.Thread(target=refresh_thread, daemon=True).start()
    
    def trigger_typing(self):
        if typing_engine.is_typing:
            return
        QTimer.singleShot(0, self.start_typing)
    
    def start_typing(self):
        try:
            text = pyperclip.paste()
        except:
            self.update_status("Could not read clipboard", "#ff6b6b")
            return
        
        if not text:
            self.update_status("Clipboard is empty", "#ff6b6b")
            return
        
        char_count = len(text.replace('\r', ''))
        
        if api_client.credits < char_count:
            self.update_status(f"Need {char_count} credits, have {api_client.credits}", "#ff6b6b")
            return
        
        self.update_status(f"Typing {char_count} characters...", "#fcc419")
        self.progress_bar.setValue(0)
        
        def type_thread():
            success_count = typing_engine.type_text(text)
            if success_count > 0:
                result = api_client.deduct_credits(success_count)
                if result["success"]:
                    self.signals.credits_signal.emit(api_client.credits)
                    remaining = result['data']['remaining_credits']
                    self.signals.update_signal.emit(
                        f"Done! Typed {success_count} chars. {remaining} left", "#51cf66"
                    )
                else:
                    self.signals.update_signal.emit(f"Warning: {result['error']}", "#fcc419")
        
        threading.Thread(target=type_thread, daemon=True).start()
    
    def logout(self):
        self.unregister_hotkey()
        api_client.logout()
        self.close()
        start_app()
    
    def closeEvent(self, event):
        self.unregister_hotkey()
        session_file = os.path.join(os.path.dirname(__file__), ".session")
        if api_client.is_logged_in():
            api_client.save_session(session_file)
        event.accept()


def start_app():
    """Start the application"""
    app = QApplication.instance()
    if app is None:
        app = QApplication(sys.argv)
    
    session_file = os.path.join(os.path.dirname(__file__), ".session")
    
    if api_client.load_session(session_file):
        window = MainWindow()
        window.show()
    else:
        def on_login_success():
            main_window = MainWindow()
            main_window.show()
        
        login = LoginWindow(on_login_success)
        login.show()
    
    sys.exit(app.exec())


if __name__ == "__main__":
    start_app()
