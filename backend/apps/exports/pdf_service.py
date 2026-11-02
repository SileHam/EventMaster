import io
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfgen import canvas as rl_canvas


def generate_attendance_pdf(event):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm)
    styles = getSampleStyleSheet()
    elements = []

    title_style = ParagraphStyle('Title', fontSize=18, alignment=TA_CENTER, spaceAfter=6)
    sub_style = ParagraphStyle('Sub', fontSize=11, alignment=TA_CENTER, spaceAfter=12, textColor=colors.grey)

    elements.append(Paragraph('EventMaster', title_style))
    elements.append(Paragraph(event.title, ParagraphStyle('H2', fontSize=14, alignment=TA_CENTER, spaceAfter=4)))
    elements.append(Paragraph(
        f"Date: {event.date.strftime('%d/%m/%Y %H:%M')} | Location: {event.location}",
        sub_style
    ))
    elements.append(Spacer(1, 8*mm))

    headers = ['#', 'Name', 'Email', 'Phone', 'Status']
    data = [headers]
    regs = event.registrations.filter(status__in=['pending', 'confirmed']).select_related('participant')
    for i, reg in enumerate(regs, 1):
        p = reg.participant
        data.append([str(i), p.name, p.email, p.phone or '-', reg.status.capitalize()])

    table = Table(data, colWidths=[15*mm, 50*mm, 65*mm, 35*mm, 25*mm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f4ff')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(table)

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generate_badge_pdf(registration):
    A6_LANDSCAPE = (148*mm, 105*mm)
    buffer = io.BytesIO()
    c = rl_canvas.Canvas(buffer, pagesize=A6_LANDSCAPE)
    w, h = A6_LANDSCAPE

    c.setStrokeColor(colors.HexColor('#2563eb'))
    c.setLineWidth(4)
    c.rect(5*mm, 5*mm, w - 10*mm, h - 10*mm)

    c.setFillColor(colors.HexColor('#2563eb'))
    c.rect(5*mm, h - 22*mm, w - 10*mm, 17*mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont('Helvetica-Bold', 14)
    c.drawCentredString(w / 2, h - 16*mm, 'EventMaster')

    c.setFillColor(colors.HexColor('#1e293b'))
    c.setFont('Helvetica-Bold', 20)
    c.drawCentredString(w / 2, h - 42*mm, registration.participant.name)

    c.setFont('Helvetica', 10)
    c.setFillColor(colors.HexColor('#374151'))
    c.drawCentredString(w / 2, h - 55*mm, registration.event.title)
    c.drawCentredString(w / 2, h - 64*mm, registration.event.date.strftime('%d %B %Y — %H:%M'))
    c.drawCentredString(w / 2, h - 72*mm, registration.event.location)

    c.setStrokeColor(colors.HexColor('#d1d5db'))
    c.setLineWidth(1)
    c.roundRect(w - 43*mm, 10*mm, 35*mm, 22*mm, 3*mm, stroke=1, fill=0)
    c.setFont('Helvetica-Bold', 9)
    c.setFillColor(colors.HexColor('#2563eb'))
    c.drawCentredString(w - 25.5*mm, 23*mm, 'BADGE ID')
    c.setFont('Helvetica-Bold', 12)
    c.drawCentredString(w - 25.5*mm, 17*mm, str(registration.id))

    c.setFont('Helvetica', 7)
    c.setFillColor(colors.grey)
    c.drawString(8*mm, 10*mm, f"ID: {registration.id}")

    c.save()
    buffer.seek(0)
    return buffer
