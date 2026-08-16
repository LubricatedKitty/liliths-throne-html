"""Build KittyLoader.exe into the project root."""
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
BUILD_DIR = os.path.join(ROOT, "buildModloader")
WORK_DIR = os.path.join(BUILD_DIR, "work")
DIST_DIR = os.path.join(BUILD_DIR, "dist")
SPEC_DIR = BUILD_DIR
LOADER = os.path.join(ROOT, "KittyLoader.py")
PATCHER = os.path.join(ROOT, "KittyPatcher CC v0.1.6.py")
EXE_NAME = "KittyLoader.exe"


def main():
    os.chdir(ROOT)
    if not os.path.isfile(LOADER):
        print("Missing KittyLoader.py")
        return 1
    if not os.path.isfile(PATCHER):
        print("Missing KittyPatcher CC v0.1.6.py")
        return 1

    os.makedirs(BUILD_DIR, exist_ok=True)
    os.makedirs(WORK_DIR, exist_ok=True)
    os.makedirs(DIST_DIR, exist_ok=True)

    try:
        import PyInstaller  # noqa: F401
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])

    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm",
        "--onefile",
        "--windowed",
        "--name", "KittyLoader",
        "--distpath", DIST_DIR,
        "--workpath", WORK_DIR,
        "--specpath", SPEC_DIR,
        "--add-data", f"{PATCHER}{os.pathsep}.",
        "--hidden-import", "shlex",
        "--hidden-import", "re",
        "--hidden-import", "subprocess",
        "--hidden-import", "shutil",
        "--hidden-import", "argparse",
        "--hidden-import", "collections",
        "--hidden-import", "importlib.util",
        LOADER,
    ]
    print("Running:", " ".join(cmd))
    subprocess.check_call(cmd)

    built = os.path.join(DIST_DIR, EXE_NAME)
    dest = os.path.join(ROOT, EXE_NAME)
    if not os.path.isfile(built):
        print("PyInstaller did not produce", built)
        return 1
    shutil.copy2(built, dest)
    print("Copied", built, "->", dest)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
