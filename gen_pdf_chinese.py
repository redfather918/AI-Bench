#!/usr/bin/env python3
"""Convert NIHO_PRD.md to PDF with Chinese font support using fpdf2."""

import re
import warnings
warnings.filterwarnings('ignore')
from fpdf import FPDF

# --- Configuration ---
MD_FILE = r"C:\Users\HUAWEI\WorkBuddy\2026-06-11-13-29-33\NIHO_PRD.md"
PDF_OUT = r"C:\Users\HUAWEI\WorkBuddy\2026-06-11-13-29-33\NIHO_PRD.pdf"
FONT_REGULAR = r"C:\Windows\Fonts\msyh.ttc"
FONT_BOLD = r"C:\Windows\Fonts\msyhbd.ttc"

class ChinesePDF(FPDF):
    def __init__(self):
        super().__init__(orientation='P', unit='mm', format='A4')
        self.add_font('CJK', '', FONT_REGULAR)
        self.add_font('CJK', 'B', FONT_BOLD)
        self.set_auto_page_break(True, 20)
        self.page_width = 210
        self.margin = 20
        self.content_width = self.page_width - 2 * self.margin

    def header(self):
        self.set_font('CJK', '', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 8, 'NIHO 项目 - 产品需求文档 (PRD)  |  v1.0', align='L')
        self.ln(4)
        self.set_draw_color(22, 33, 62)
        self.line(self.margin, self.get_y(), self.page_width - self.margin, self.get_y())
        self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font('CJK', '', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'{self.page_no()}', align='C')

    def write_h1(self, text):
        self.ln(4)
        self.set_font('CJK', 'B', 18)
        self.set_text_color(26, 26, 46)
        y = self.get_y()
        self.cell(0, 10, text)
        self.ln(12)
        # underline
        self.set_draw_color(22, 33, 62)
        self.set_line_width(0.6)
        self.line(self.margin, self.get_y() - 2, self.page_width - self.margin, self.get_y() - 2)
        self.set_line_width(0.2)
        self.ln(6)

    def write_h2(self, text):
        self.ln(3)
        self.set_font('CJK', 'B', 14)
        self.set_text_color(15, 52, 96)
        self.cell(0, 8, text)
        self.ln(10)
        self.set_draw_color(233, 69, 96)
        self.set_line_width(0.4)
        self.line(self.margin, self.get_y() - 2, self.margin + 60, self.get_y() - 2)
        self.set_line_width(0.2)
        self.ln(4)

    def write_h3(self, text):
        self.ln(2)
        self.set_font('CJK', 'B', 12)
        self.set_text_color(22, 33, 62)
        self.cell(0, 8, text)
        self.ln(10)

    def write_h4(self, text):
        self.ln(2)
        self.set_font('CJK', 'B', 11)
        self.set_text_color(83, 52, 131)
        self.cell(0, 8, text)
        self.ln(9)

    def write_para(self, text):
        self.set_font('CJK', '', 10)
        self.set_text_color(51, 51, 51)
        self.multi_cell(self.content_width, 6.5, text)
        self.ln(2)

    def write_blockquote(self, lines):
        self.set_fill_color(254, 245, 247)
        self.set_draw_color(233, 69, 96)
        x = self.get_x()
        y = self.get_y()
        # Draw left border bar
        self.set_fill_color(233, 69, 96)
        self.rect(x, y, 2, len(lines) * 7 + 6, 'F')
        # Draw background
        self.set_fill_color(254, 245, 247)
        self.set_x(x + 3)
        self.set_font('CJK', '', 9)
        self.set_text_color(85, 85, 85)
        for line in lines:
            self.cell(self.content_width - 5, 7, line)
            self.ln(7)
        self.ln(3)

    def write_code_block(self, lines):
        self.set_fill_color(26, 26, 46)
        y_start = self.get_y()
        h = len(lines) * 5.5 + 8
        self.rect(self.margin, y_start, self.content_width, h, 'F')
        self.set_xy(self.margin + 4, y_start + 4)
        self.set_font('CJK', '', 8)
        self.set_text_color(240, 240, 240)
        for line in lines:
            self.cell(0, 5.5, line)
            self.ln(5.5)
        self.set_y(y_start + h + 3)
        self.set_text_color(51, 51, 51)

    def write_inline_code(self, text):
        # Render bold to simulate inline code
        self.set_font('CJK', 'B', 9)
        self.set_text_color(233, 69, 96)
        self.cell(self.get_string_width(text) + 2, 6.5, ' ' + text + ' ')
        self.set_text_color(51, 51, 51)

    def write_bold_text(self, text):
        self.set_font('CJK', 'B', 10)
        self.set_text_color(22, 33, 62)
        self.write(6.5, text)
        self.set_text_color(51, 51, 51)

    def write_bullet(self, text, level=0):
        indent = level * 6
        self.set_x(self.margin + indent)
        self.set_font('CJK', '', 10)
        self.set_text_color(51, 51, 51)
        bullet = '•' if level == 0 else '-'
        self.cell(5, 6, bullet)
        self.multi_cell(self.content_width - indent - 5, 6, text)
        self.ln(1)

    def write_table(self, header, rows):
        """Write a table with header row and data rows."""
        self.ln(2)
        col_widths = []
        # Calculate column widths
        avg = self.content_width / len(header)
        for i, h in enumerate(header):
            w = self.get_string_width(h) + 8
            col_widths.append(max(w, avg * 0.8, 25))

        # Scale widths to fit
        total = sum(col_widths)
        if total > self.content_width:
            scale = self.content_width / total
            col_widths = [w * scale for w in col_widths]
        else:
            # distribute remaining space
            extra = (self.content_width - total) / len(header)
            col_widths = [w + extra for w in col_widths]

        # Header
        self.set_fill_color(22, 33, 62)
        self.set_text_color(255, 255, 255)
        self.set_font('CJK', 'B', 9)
        row_h = 8
        for i, h in enumerate(header):
            self.cell(col_widths[i], row_h, ' ' + h + ' ', border=0, fill=True)
        self.ln()

        # Rows
        self.set_text_color(51, 51, 51)
        for ri, row in enumerate(rows):
            if ri % 2 == 0:
                self.set_fill_color(249, 249, 249)
            else:
                self.set_fill_color(255, 255, 255)
            self.set_font('CJK', '', 8.5)
            for i, cell in enumerate(row):
                self.cell(col_widths[i], 7, ' ' + str(cell)[:80] + ' ', border=0, fill=True)
            self.ln()
        self.ln(3)
        self.set_text_color(51, 51, 51)

    def write_hr(self):
        self.ln(2)
        self.set_draw_color(200, 200, 200)
        self.line(self.margin + 20, self.get_y(), self.page_width - self.margin - 20, self.get_y())
        self.ln(4)


# ============ Markdown parsing ============

def parse_markdown(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()


def render_to_pdf(md_text, pdf_obj):
    """Simple markdown line-by-line parser & renderer."""
    lines = md_text.split('\n')
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        # Code block (fenced)
        if stripped.startswith('```'):
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code_lines.append(lines[i])
                i += 1
            i += 1  # skip closing ```
            pdf_obj.write_code_block(code_lines)
            continue

        # Table (detect by looking ahead for |---| separator)
        if '|' in stripped and i + 1 < len(lines) and re.match(r'^\|[\s\-:|]+\|$', lines[i + 1].strip()):
            # Parse header
            header = [c.strip() for c in stripped.split('|')[1:-1]]
            i += 2  # skip header and separator
            rows = []
            while i < len(lines) and '|' in lines[i]:
                row_line = lines[i].strip()
                if row_line:
                    cells = [c.strip() for c in row_line.split('|')[1:-1]]
                    rows.append(cells)
                i += 1
            pdf_obj.write_table(header, rows)
            continue

        # Headers
        if stripped.startswith('# '):
            pdf_obj.write_h1(stripped[2:])
            i += 1; continue
        if stripped.startswith('## '):
            pdf_obj.write_h2(stripped[3:])
            i += 1; continue
        if stripped.startswith('### '):
            pdf_obj.write_h3(stripped[4:])
            i += 1; continue
        if stripped.startswith('#### '):
            pdf_obj.write_h4(stripped[5:])
            i += 1; continue

        # Horizontal rule
        if stripped in ('---', '***', '___'):
            pdf_obj.write_hr()
            i += 1; continue

        # Blockquote
        if stripped.startswith('> '):
            bq_lines = []
            while i < len(lines) and lines[i].strip().startswith('> '):
                bq_lines.append(clean_inline(lines[i].strip()[2:]))
                i += 1
            pdf_obj.write_blockquote(bq_lines)
            continue

        # Unordered list
        if re.match(r'^(\s*)[-*+]\s', stripped):
            while i < len(lines) and re.match(r'^(\s*)[-*+]\s', lines[i].strip()):
                li = lines[i].strip()
                match = re.match(r'^(\s*)[-*+]\s(.*)', li)
                if match:
                    indent = len(match.group(1))
                    level = indent // 2
                    pdf_obj.write_bullet(clean_inline(match.group(2)), level)
                i += 1
            continue

        # Ordered list
        if re.match(r'^\d+[.)]\s', stripped):
            while i < len(lines) and re.match(r'^\d+[.)]\s', lines[i].strip()):
                li = re.sub(r'^\d+[.)]\s', '• ', lines[i].strip())
                pdf_obj.write_bullet(clean_inline(li[2:]))
                i += 1
            continue

        # Regular paragraph
        para_parts = []
        while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith(('#', '>', '|', '```', '-', '*', '+')) and not re.match(r'^\d+[.)]\s', lines[i].strip()):
            para_parts.append(lines[i].strip())
            i += 1

        para = ' '.join(para_parts)
        if para:
            write_formatted_para(pdf_obj, para)

    return pdf_obj


def clean_inline(text):
    """Strip markdown formatting for simple inline text."""
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)  # bold
    text = re.sub(r'__(.+?)__', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)       # italic
    text = re.sub(r'_(.+?)_', r'\1', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)       # inline code
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)  # links
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)    # images
    return text


def write_formatted_para(pdf, text):
    """Write a paragraph with basic bold/inline-code support."""
    # Split on bold markers
    pdf.set_font('CJK', '', 10)
    pdf.set_text_color(51, 51, 51)

    x = pdf.margin
    y = pdf.get_y()
    pdf.set_xy(x, y)

    # Process text with basic formatting
    # Handle **bold**, `code`, and plain text
    tokens = re.split(r'(\*\*.+?\*\*|`[^`]+`)', text)

    line_buffer = ''
    for token in tokens:
        if token.startswith('**') and token.endswith('**'):
            # Bold
            inner = token[2:-2]
            w = pdf.get_string_width(line_buffer) + pdf.get_string_width(inner)
            if w > pdf.content_width and line_buffer:
                pdf.cell(pdf.content_width, 6.5, line_buffer)
                pdf.ln()
                pdf.set_x(pdf.margin)
                line_buffer = ''
            pdf.set_font('CJK', 'B', 10)
            pdf.set_text_color(22, 33, 62)
            pdf.write(6.5, inner)
            pdf.set_font('CJK', '', 10)
            pdf.set_text_color(51, 51, 51)
        elif token.startswith('`') and token.endswith('`'):
            inner = token[1:-1]
            w = pdf.get_string_width(line_buffer) + pdf.get_string_width(inner)
            if w > pdf.content_width and line_buffer:
                pdf.cell(pdf.content_width, 6.5, line_buffer)
                pdf.ln()
                pdf.set_x(pdf.margin)
                line_buffer = ''
            pdf.set_font('CJK', 'B', 9)
            pdf.set_text_color(233, 69, 96)
            pdf.write(6.5, ' ' + inner + ' ')
            pdf.set_font('CJK', '', 10)
            pdf.set_text_color(51, 51, 51)
        else:
            w = pdf.get_string_width(line_buffer) + pdf.get_string_width(token)
            if w > pdf.content_width and line_buffer:
                pdf.cell(pdf.content_width, 6.5, line_buffer)
                pdf.ln()
                pdf.set_x(pdf.margin)
                line_buffer = token
            else:
                line_buffer += token

    if line_buffer:
        pdf.multi_cell(pdf.content_width, 6.5, line_buffer)
    pdf.ln(2)


# =========== Main ===========

if __name__ == '__main__':
    print('Reading markdown...')
    md_content = parse_markdown(MD_FILE)

    print('Creating PDF with Chinese support...')
    pdf = ChinesePDF()
    pdf.set_margin(20)
    pdf.add_page()

    pdf = render_to_pdf(md_content, pdf)

    print(f'Saving PDF to {PDF_OUT}...')
    pdf.output(PDF_OUT)
    print(f'Done! PDF generated: {PDF_OUT}')
