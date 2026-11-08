#!/usr/bin/env python3
"""Adds the spine-safety and at-home sections (data: safety_data.py) to every exercise page that lacks them.
Never touches a page that already has them. Run from anywhere; then run build-reference-module.js."""
import os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, here)
from safety_data import D

root = os.path.join(here, '..', 'exercise-pages')
TEXT = {
    'en': dict(spine='## 🛡️ Spine safety', home='## 🛋️ At home, with what you have', video='## Video',
               warn='> [!warning] Spine caution: this exercise can load the lower back or neck more than most. Read the safety note and go light.'),
    'ru': dict(spine='## 🛡️ Безопасность для позвоночника', home='## 🛋️ Дома, подручными средствами', video='## Video',
               warn='> [!warning] Осторожно со спиной: упражнение может сильнее обычного нагружать поясницу или шею. Прочитай заметку по безопасности и работай с лёгким весом.'),
}
done = 0
for lang in ('en', 'ru'):
    t = TEXT[lang]
    for cat in sorted(os.listdir(os.path.join(root, lang))):
        for f in sorted(os.listdir(os.path.join(root, lang, cat))):
            p = os.path.join(root, lang, cat, f)
            s = open(p, encoding='utf8').read()
            if t['spine'] in s:
                continue
            hid = int(re.search(r'^helper_id: (\d+)', s, re.M).group(1))
            flag, sp_en, sp_ru, ho_en, ho_ru = D[hid]
            spine, home = (sp_en, ho_en) if lang == 'en' else (sp_ru, ho_ru)
            has_caution = any(m in s for m in ('[!warning] Note:', '[!warning] Внимание:', '[!warning] Взрывное'))
            block = t['spine'] + '\n\n' + (t['warn'] + '\n\n' if flag == 'W' and not has_caution else '') + spine + '\n\n' + t['home'] + '\n\n' + home + '\n\n'
            if flag == 'W':
                s = s.replace('\nhelper_id:', '\nspine_warning: true\nhelper_id:', 1)
            if '\n' + t['video'] in s:
                s = s.replace('\n' + t['video'], '\n' + block + t['video'], 1)
            else:
                s = s.rstrip('\n') + '\n\n' + block.rstrip('\n') + '\n'
            open(p, 'w', encoding='utf8').write(s)
            done += 1
print('pages changed', done)
