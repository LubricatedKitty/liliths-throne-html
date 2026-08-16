import os
import re
import subprocess
import shlex
import sys
import shutil
from collections import defaultdict

# KittyPatcher CC v0.1.6
# Bare Replace: still targets index.html.
# Replace [relative/path.ext]: targets that file under the project folder.
# Add Javascript [relative/path.ext]: appends the following block to that file.
# Add Content [relative/path.ext]: appends the following block to that file.

html_file = os.path.abspath('index.html')
project_root = os.path.dirname(html_file)
mods_folder = os.path.join(os.getcwd(), "mods")
logs_folder = os.path.join(mods_folder, "logs")
backup_folder = os.path.join(logs_folder, "backup")
mainlog_file = os.path.join(logs_folder, 'MainPatchLog.txt')
log_file = os.path.join(logs_folder, 'ModPatchLog.txt')
faillog_file = os.path.join(logs_folder, 'FailsPatchLog.txt')
customlog_file = os.path.join(os.getcwd(), 'CustomLog.txt')
current_file_name = os.path.basename(sys.argv[0])
cache_dir = os.path.join(logs_folder, 'cache')

OP_HEADER = re.compile(
    r'^(?P<kind>Replace|Add Javascript|Add Content)(?:\s+\[(?P<target>.+?)\])?:\s*$'
)


def create_directories():
    try:
        for path in (mods_folder, logs_folder, backup_folder, cache_dir):
            if not os.path.exists(path):
                os.makedirs(path)
    except Exception as e:
        handle_output(f"An error occurred: {e}", "console")


def normalize_newlines(text):
    return str(text or "").replace("\r\n", "\n").replace("\r", "\n")


def _strip_inline_hash_comment(line):
    in_single = False
    in_double = False
    escaped = False
    for i, ch in enumerate(line):
        if escaped:
            escaped = False
            continue
        if ch == "\\" and (in_single or in_double):
            escaped = True
            continue
        if ch == "'" and not in_double:
            in_single = not in_single
        elif ch == '"' and not in_single:
            in_double = not in_double
        elif ch == "#" and not in_single and not in_double:
            return line[:i].rstrip()
    return line


def strip_mod_comments(text):
    """Drop Python-style # comments. Quoted # characters are kept."""
    kept = []
    for line in normalize_newlines(text).split("\n"):
        if line.lstrip().startswith("#"):
            continue
        kept.append(_strip_inline_hash_comment(line))
    return "\n".join(kept)


def resolve_patch_target(target):
    target = (target or "").strip().replace("\\", "/")
    if not target or target in ("index.html", "./index.html"):
        return os.path.abspath(html_file)
    if os.path.isabs(target) or target.startswith("/") or any(part == ".." for part in target.split("/")):
        raise ValueError("Patch target must stay inside the project: " + target)
    resolved = os.path.abspath(os.path.join(project_root, *target.split("/")))
    if os.path.commonpath([project_root, resolved]) != project_root:
        raise ValueError("Patch target escaped the project: " + target)
    lowered = resolved.lower().replace("\\", "/")
    if "kittypatcher" in os.path.basename(resolved).lower() or "/kittypatcher" in lowered:
        raise ValueError("Refusing to patch KittyPatcher itself: " + target)
    return resolved


def backup_path_for(target_file):
    rel = os.path.relpath(target_file, project_root)
    return os.path.join(backup_folder, rel)


def backup_or_restore(target_file, create_if_missing=False):
    if not os.path.isfile(target_file):
        if not create_if_missing:
            handle_output(f"Target file does not exist: {target_file}", "failed")
            return False
        dest_dir = os.path.dirname(target_file)
        if dest_dir and not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        with open(target_file, 'w', encoding='utf-8', errors='ignore'):
            pass
        handle_output(f"Created missing target file: {target_file}", "log")
    dest = backup_path_for(target_file)
    dest_dir = os.path.dirname(dest)
    if dest_dir and not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
    if not os.path.exists(dest):
        shutil.copy(target_file, dest)
        handle_output(f"Backup created at: {dest}", "log")
    else:
        shutil.copy(dest, target_file)
        handle_output(f"Backup restored from: {dest} to {target_file}", "log")
    return True


def open_in_browser(html_path):
    if not os.path.isfile(html_path):
        handle_output(f"The HTML file does not exist: {html_path}", "console")
        return

    if sys.platform.startswith('win'):
        browsers = {
            "chrome": r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            "firefox": r"C:\Program Files\Mozilla Firefox\firefox.exe",
            "opera": r"C:\Program Files\Opera\launcher.exe",
            "edge": r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            "brave": r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
        }
    elif sys.platform.startswith('darwin'):
        browsers = {
            "chrome": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "firefox": "/Applications/Firefox.app/Contents/MacOS/firefox",
            "opera": "/Applications/Opera.app/Contents/MacOS/Opera",
            "safari": "/Applications/Safari.app/Contents/MacOS/Safari",
            "edge": "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
            "brave": "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
        }
    else:
        handle_output("Unsupported operating system.", "console")
        return

    if os.path.exists(browsers["chrome"]):
        command_string = f"{shlex.quote(browsers['chrome'])} --app={shlex.quote(html_path)}"
        command = shlex.split(command_string)
        try:
            subprocess.Popen(command)
            return
        except Exception as e:
            handle_output(f"Failed to launch Chrome with command {command}: {e}", "console")

    handle_output("Chrome is not available. Please check your installation.", "console")


def handle_output(message, output_type=""):
    if output_type == "log":
        log_message(message, "mod")
    elif output_type == "console":
        print_to_console(message)
    elif output_type == "alllogs":
        log_message(message, "")
    elif output_type == "all":
        log_message(message, "mod")
    elif output_type == "failed":
        log_message(message, "failed")
    elif output_type == "custom":
        log_message(message, "custom")


def log_message(message, log_type="mod"):
    if log_type == "main":
        with open(mainlog_file, 'a', encoding='utf-8', errors='ignore') as log:
            log.write(message + '\n')
    elif log_type == "mod":
        with open(log_file, 'a', encoding='utf-8', errors='ignore') as log:
            log.write(message + '\n')
    elif log_type == "failed":
        with open(faillog_file, 'a', encoding='utf-8', errors='ignore') as log:
            log.write(message + '\n')
    elif log_type == "custom":
        with open(customlog_file, 'a', encoding='utf-8', errors='ignore') as log:
            log.write(message + '\n')
    else:
        with open(mainlog_file, 'a', encoding='utf-8', errors='ignore') as log:
            log.write(message + '\n')
        with open(log_file, 'a', encoding='utf-8', errors='ignore') as log:
            log.write(message + '\n')


def print_to_console(message):
    print(message)


def clear_logs():
    for path in (mainlog_file, log_file, faillog_file):
        with open(path, 'w'):
            pass


def check_for_repeats(mod_file_indexes):
    line_count = defaultdict(lambda: {'count': 0, 'files': set()})
    for mod_file, old_lines in mod_file_indexes.items():
        for line in old_lines:
            line_count[line]['count'] += 1
            line_count[line]['files'].add(mod_file)
    for line, data in line_count.items():
        if data['count'] > 1:
            files = ', '.join(data['files'])
            handle_output(
                f"Warning: '{line}' is repeated {data['count']} times across the following mod files: {files}",
                "alllogs"
            )


def update_old_lines_from_content(old_lines, file_content):
    marker = "[to]"
    if marker not in old_lines:
        return old_lines
    prefix, suffix = old_lines.split(marker, 1)
    pattern = re.escape(prefix) + r'(.*?)' + re.escape(suffix)
    match = re.search(pattern, file_content, re.DOTALL)
    if match:
        return prefix + match.group(1) + suffix
    return old_lines


def parse_mod_chunks(mod_content):
    chunks = []
    current = None
    for line in normalize_newlines(strip_mod_comments(mod_content)).split("\n"):
        header = OP_HEADER.match(line.strip())
        if header:
            if current:
                chunks.append(current)
            kind = header.group("kind")
            current = {
                "kind": "append" if kind in ("Add Javascript", "Add Content") else "replace",
                "command": kind,
                "target": (header.group("target") or "").strip(),
                "body": []
            }
            continue
        if current is not None:
            current["body"].append(line)
    if current:
        chunks.append(current)
    return chunks


def add_replacement(mod_list, old_line_stripped, new_line_stripped, target_file):
    for item in mod_list:
        if item.get('type', 'replace') != 'replace':
            continue
        if item['old_line'] == old_line_stripped and item.get('target') == target_file:
            item['new_line'] += f"\n{new_line_stripped}"
            return
    mod_list.append({
        'type': 'replace',
        'old_line': old_line_stripped,
        'new_line': new_line_stripped,
        'target': target_file
    })


def add_append(mod_list, new_line_stripped, target_file, mod_file, command="Add Javascript"):
    mod_list.append({
        'type': 'append',
        'old_line': f"[{command} {mod_file} -> {os.path.relpath(target_file, project_root)}]",
        'new_line': new_line_stripped,
        'target': target_file,
        'mod_file': mod_file,
        'command': command
    })


def proc_replacement(mod_content, mod_list, mod_file_indexes, mod_file, old_delim, new_delim):
    default_target = os.path.abspath(html_file)
    mod_content = strip_mod_comments(mod_content)

    if old_delim == 'Replace:':
        chunks = parse_mod_chunks(mod_content)
    else:
        chunks = []
        for replacement in mod_content.split(old_delim):
            chunks.append({"kind": "replace", "command": "Replace", "target": "", "body": replacement.split("\n")})

    for chunk in chunks:
        replacement = "\n".join(chunk["body"])
        handle_output(f"Custom Log Chunk: {replacement}", "custom")

        try:
            command = chunk.get("command") or "Replace"
            if chunk.get("kind") == "append" and not chunk.get("target"):
                raise ValueError(command + " requires a file: " + command + " [path/file.ext]:")
            target_file = resolve_patch_target(chunk.get("target") or "")
        except ValueError as e:
            handle_output(str(e), "failed")
            handle_output(str(e), "log")
            continue

        if chunk.get("kind") == "append":
            new_line_stripped = replacement.strip()
            if not new_line_stripped:
                continue
            command = chunk.get("command") or "Add Content"
            add_append(mod_list, new_line_stripped, target_file, mod_file, command)
            label = f"[{command} -> {os.path.relpath(target_file, project_root)}]"
        else:
            if new_delim not in replacement:
                continue
            old_lines, new_lines = replacement.split(new_delim, 1)
            old_line_stripped = old_lines.strip()
            new_line_stripped = new_lines.strip()
            if not old_line_stripped:
                continue
            add_replacement(mod_list, old_line_stripped, new_line_stripped, target_file)
            label = old_line_stripped

        if mod_file not in mod_file_indexes:
            mod_file_indexes[mod_file] = []
        mod_file_indexes[mod_file].append(label)


def iter_mod_files(folder, only_files=None):
    """Yield (basename, full_path) for .mod files. only_files preserves that order."""
    found = {}
    for root, dirs, files in os.walk(folder):
        dirs[:] = [d for d in dirs if d.lower() not in ("logs", "backup", "cache")]
        for name in files:
            if name.lower().endswith('.mod'):
                found[name.lower()] = (name, os.path.join(root, name))

    if only_files is None:
        for key in sorted(found):
            yield found[key]
        return

    seen = set()
    for item in only_files:
        base = os.path.basename(str(item)).lower()
        if base in seen:
            continue
        seen.add(base)
        if base in found:
            yield found[base]


def load_mods(folder, only_files=None):
    mod_list = []
    mod_file_indexes = {}
    successful_mod_files = []
    for mod_file, mod_path in iter_mod_files(folder, only_files):
        with open(mod_path, 'r', encoding='utf-8', errors='ignore') as mod:
            mod_content = mod.read()
        proc_replacement(mod_content, mod_list, mod_file_indexes, mod_file, '~~', '~')
        proc_replacement(mod_content, mod_list, mod_file_indexes, mod_file, 'Replace:', 'With:')
        successful_mod_files.append(mod_file)
    return mod_list, mod_file_indexes, successful_mod_files


def patch_one_file(target_file, items, mod_file_indexes, totals):
    create_if_missing = any(item.get('type') == 'append' for item in items)
    if not backup_or_restore(target_file, create_if_missing=create_if_missing):
        totals['failed'] += len(items)
        return

    with open(target_file, 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()

    rel = os.path.relpath(target_file, project_root)

    for item in items:
        if item.get('type') == 'append':
            if content and not content.endswith('\n'):
                content += '\n'
            if content:
                content += '\n'
            content += item['new_line']
            if not content.endswith('\n'):
                content += '\n'
            command = item.get("command") or "Add Content"
            handle_output(f"[{rel}] Appended ({command}) from {item.get('mod_file', 'mod')}", "log")
            totals['made'] += 1
            for key, value in mod_file_indexes.items():
                if item['old_line'] in value:
                    totals['successful_mods'].append(key)
            continue

        old_lines = update_old_lines_from_content(item['old_line'], content)
        new_lines = item['new_line']
        old_lines_pattern = re.escape(old_lines).replace(r'\n', r'\s*')
        pattern = rf'({old_lines_pattern})'

        if re.search(pattern, content):
            handle_output(f"[{rel}] Replacing '{old_lines}' with '{new_lines}'", "log")
            content = re.sub(pattern, lambda _m, repl=new_lines: repl, content)
            totals['made'] += 1
            for key, value in mod_file_indexes.items():
                if old_lines in value:
                    totals['successful_mods'].append(key)
        else:
            handle_output(f"[{rel}] No match found for '{old_lines}'", "log")
            handle_output(f"[{rel}] No match found for '{old_lines}'", "failed")
            totals['failed'] += 1
            for key, value in mod_file_indexes.items():
                if old_lines in value:
                    totals['failed_mods'].append(key)

    with open(target_file, 'w', encoding='utf-8', errors='ignore') as file:
        file.write(content)


def parse_mod_meta(mod_content):
    meta = {
        "name": "",
        "author": "",
        "description": "",
        "category": "",
        "version": "",
        "game_version": "",
    }
    key_map = {
        "name": "name",
        "author": "author",
        "description": "description",
        "category": "category",
        "version": "version",
        "game version": "game_version",
        "game_version": "game_version",
    }
    for raw in normalize_newlines(strip_mod_comments(mod_content)).split("\n"):
        line = raw.strip()
        if not line:
            continue
        if OP_HEADER.match(line) or line.startswith("~~") or line.startswith("With:"):
            break
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        mapped = key_map.get(key.strip().lower())
        if mapped:
            meta[mapped] = value.strip()
    return meta


def collect_replace_ops(mod_content):
    """Return replace ops as {target, old} for conflict checks."""
    ops = []
    for chunk in parse_mod_chunks(mod_content):
        if chunk.get("kind") != "replace":
            continue
        body = "\n".join(chunk["body"])
        if "With:" not in body:
            continue
        old_lines, _new = body.split("With:", 1)
        old_line = old_lines.strip()
        if not old_line:
            continue
        try:
            target = resolve_patch_target(chunk.get("target") or "")
        except ValueError:
            continue
        ops.append({"target": target, "old": old_line})
    return ops


def apply_project_root(root=None):
    global html_file, project_root, mods_folder, logs_folder, backup_folder
    global mainlog_file, log_file, faillog_file, cache_dir

    if not root:
        return
    root = os.path.abspath(root)
    html_file = os.path.join(root, "index.html")
    project_root = root
    mods_folder = os.path.join(root, "mods")
    logs_folder = os.path.join(mods_folder, "logs")
    backup_folder = os.path.join(logs_folder, "backup")
    mainlog_file = os.path.join(logs_folder, "MainPatchLog.txt")
    log_file = os.path.join(logs_folder, "ModPatchLog.txt")
    faillog_file = os.path.join(logs_folder, "FailsPatchLog.txt")
    cache_dir = os.path.join(logs_folder, "cache")


def restore_backups(root=None):
    """Copy every file in mods/logs/backup back over the live project files."""
    apply_project_root(root)
    create_directories()
    restored = []
    missing = []
    if not os.path.isdir(backup_folder):
        return {"ok": True, "restored": restored, "missing": missing}
    for dirpath, _dirs, files in os.walk(backup_folder):
        for name in files:
            src = os.path.join(dirpath, name)
            rel = os.path.relpath(src, backup_folder)
            dest = os.path.join(project_root, rel)
            dest_dir = os.path.dirname(dest)
            if dest_dir and not os.path.exists(dest_dir):
                os.makedirs(dest_dir)
            try:
                shutil.copy2(src, dest)
                restored.append(rel.replace("\\", "/"))
                handle_output(f"Restored {rel}", "log")
            except Exception as exc:
                missing.append(f"{rel}: {exc}")
                handle_output(f"Failed to restore {rel}: {exc}", "failed")
    return {"ok": len(missing) == 0, "restored": restored, "missing": missing}


def run_patch(enabled_mod_files=None, pause=False, root=None):
    """
    Apply mods. Double-click uses every .mod file.
    KittyLoader passes enabled filenames in priority order.
    """
    apply_project_root(root)

    create_directories()
    mod_list, mod_file_indexes, successful_mod_files = load_mods(mods_folder, enabled_mod_files)
    patch_targets(mod_list, mod_file_indexes)
    result = {
        "ok": True,
        "processed": successful_mod_files,
        "log": log_file,
        "fail_log": faillog_file,
    }
    if pause:
        input("Press Enter to exit...")
    return result


def patch_targets(mod_list, mod_file_indexes):
    successful_mods = []
    failed_mods = []

    clear_logs()
    with open(log_file, 'w', encoding='utf-8', errors='ignore') as log:
        log.write("Mod patching started...\n")

    by_file = {}
    for item in mod_list:
        path = item.get('target') or os.path.abspath(html_file)
        by_file.setdefault(path, []).append(item)

    totals = {
        'made': 0,
        'failed': 0,
        'successful_mods': successful_mods,
        'failed_mods': failed_mods
    }

    for path, items in by_file.items():
        patch_one_file(path, items, mod_file_indexes, totals)

    if totals['made'] == 0:
        handle_output("No matches found for any mod lines.", "log")
    else:
        handle_output(f"Total replacements made: {totals['made']}", "alllogs")
        handle_output(f"Total replacements failed: {totals['failed']}", "alllogs")
        handle_output("Successful Mods:", "alllogs")
        for mod in sorted(set(totals['successful_mods'])):
            handle_output(f"{mod}", "alllogs")
        handle_output("Failed Mods:", "alllogs")
        for mod in sorted(set(totals['failed_mods'])):
            handle_output(f"{mod}", "alllogs")

    handle_output("Mod patching complete.", "log")


def main(argv=None):
    import argparse
    parser = argparse.ArgumentParser(description="KittyPatcher CC v0.1.6")
    parser.add_argument("--mods", nargs="*", default=None, help="Only these .mod files, in this order")
    parser.add_argument("--no-pause", action="store_true", help="Do not wait for Enter (used by KittyLoader)")
    parser.add_argument("--root", default=None, help="Project folder that contains index.html and mods/")
    args = parser.parse_args(argv)

    pause = not args.no_pause
    try:
        result = run_patch(enabled_mod_files=args.mods, pause=False, root=args.root)
        handle_output(f"Mod files processed: {', '.join(result['processed'])}\n", "log")
        handle_output("Mod patching complete.", "console")
        handle_output(f"Check the log file '{result['log']}' for detailed information on what was replaced.", "console")
        if not current_file_name.lower().startswith("kitty"):
            open_in_browser(html_file)
        if pause:
            input("Press Enter to exit...")
        return result
    except Exception as e:
        handle_output(f"An error occurred: {e}", "console")
        if pause:
            input("Press Enter to exit...")
        raise


if __name__ == "__main__":
    main()
