// src/utils/workflowValidator.ts
import { ProcessWorkflow, ValidationIssue } from '../types/workflowConfig';

export function validateWorkflow(wf: ProcessWorkflow): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 1. Kiểm tra Loại đơn đã được chọn
  if (!wf.loaiDonId || !wf.loaiDonName) {
    issues.push({
      id: 'val-loai-don',
      severity: 'error',
      targetType: 'general',
      message: 'Quy trình chưa được gắn với Loại đơn áp dụng cụ thể.',
      hint: 'Vui lòng chọn loại đơn áp dụng trong phần thông tin chung.',
    });
  }

  // 2. Kiểm tra Có bước bắt đầu
  const startSteps = wf.steps.filter((s) => s.isStart);
  if (startSteps.length === 0) {
    issues.push({
      id: 'val-no-start',
      severity: 'error',
      targetType: 'general',
      message: 'Quy trình chưa có Điểm bắt đầu (Bước bắt đầu).',
      hint: 'Chọn một bước đầu vào và tích chọn "Bước bắt đầu".',
    });
  } else if (startSteps.length > 1) {
    issues.push({
      id: 'val-multiple-start',
      severity: 'warning',
      targetType: 'step',
      targetId: startSteps[1].id,
      message: `Quy trình có ${startSteps.length} bước bắt đầu. Nên có duy nhất 1 điểm khởi đầu chuẩn.`,
      hint: 'Xem xét lại cấu trúc luồng tiếp nhận.',
    });
  }

  // 3. Kiểm tra Có bước kết thúc
  const endSteps = wf.steps.filter((s) => s.isEnd);
  if (endSteps.length === 0) {
    issues.push({
      id: 'val-no-end',
      severity: 'error',
      targetType: 'general',
      message: 'Quy trình chưa có Điểm kết thúc (Bước kết thúc / Lưu hồ sơ).',
      hint: 'Chọn bước đóng hồ sơ và tích chọn "Bước kết thúc".',
    });
  }

  // 4. Kiểm tra Nhóm trách nhiệm tồn tại
  const laneIds = new Set(wf.lanes.map((l) => l.id));
  const stageIds = new Set(wf.stages.map((s) => s.id));

  wf.steps.forEach((step) => {
    if (!laneIds.has(step.laneId)) {
      issues.push({
        id: `val-lane-missing-${step.id}`,
        severity: 'error',
        targetType: 'step',
        targetId: step.id,
        message: `Bước "${step.name}" (${step.code}) gắn với Nhóm trách nhiệm không tồn tại trong cấu hình.`,
        hint: 'Gán lại nhóm trách nhiệm hợp lệ cho bước này.',
      });
    }

    if (!stageIds.has(step.stageId)) {
      issues.push({
        id: `val-stage-missing-${step.id}`,
        severity: 'error',
        targetType: 'step',
        targetId: step.id,
        message: `Bước "${step.name}" (${step.code}) gắn với Giai đoạn không tồn tại.`,
        hint: 'Gán lại giai đoạn hợp lệ.',
      });
    }

    // Kiểm tra thông tin thời hạn
    if (step.timeLimitDays <= 0 && !step.isEnd) {
      issues.push({
        id: `val-timelimit-${step.id}`,
        severity: 'warning',
        targetType: 'step',
        targetId: step.id,
        message: `Bước "${step.name}" chưa có thời hạn xử lý hợp lệ (phải lớn hơn 0 ngày).`,
        hint: 'Nhập số ngày xử lý định mức tại thuộc tính bước.',
      });
    }
  });

  // 5. Kiểm tra Connector hợp lệ & Bước cô lập
  const stepIds = new Set(wf.steps.map((s) => s.id));
  const incomingMap = new Map<string, number>();
  const outgoingMap = new Map<string, number>();

  wf.steps.forEach((s) => {
    incomingMap.set(s.id, 0);
    outgoingMap.set(s.id, 0);
  });

  wf.transitions.forEach((tr) => {
    if (!stepIds.has(tr.fromStepId)) {
      issues.push({
        id: `val-trans-from-${tr.id}`,
        severity: 'error',
        targetType: 'transition',
        targetId: tr.id,
        message: `Đường chuyển "${tr.actionName}" có bước nguồn không tồn tại.`,
        hint: 'Kiểm tra hoặc xóa đường chuyển này.',
      });
    } else {
      outgoingMap.set(tr.fromStepId, (outgoingMap.get(tr.fromStepId) || 0) + 1);
    }

    if (!stepIds.has(tr.toStepId)) {
      issues.push({
        id: `val-trans-to-${tr.id}`,
        severity: 'error',
        targetType: 'transition',
        targetId: tr.id,
        message: `Đường chuyển "${tr.actionName}" có bước đích không tồn tại.`,
        hint: 'Kiểm tra hoặc cấu hình lại bước đích.',
      });
    } else {
      incomingMap.set(tr.toStepId, (incomingMap.get(tr.toStepId) || 0) + 1);
    }

    // 6. Kiểm tra Điều kiện chuyển hợp lệ
    tr.conditions.forEach((c, idx) => {
      if (!c.fieldName.trim()) {
        issues.push({
          id: `val-cond-name-${tr.id}-${idx}`,
          severity: 'warning',
          targetType: 'transition',
          targetId: tr.id,
          message: `Đường chuyển "${tr.actionName}" có điều kiện số ${idx + 1} chưa nhập tên trường.`,
          hint: 'Chọn trường dữ liệu hoặc xóa dòng điều kiện trống.',
        });
      }
      if (
        (c.operator === '=' || c.operator === '≠' || c.operator === 'thuoc_danh_sach') &&
        !c.value.trim()
      ) {
        issues.push({
          id: `val-cond-val-${tr.id}-${idx}`,
          severity: 'warning',
          targetType: 'transition',
          targetId: tr.id,
          message: `Đường chuyển "${tr.actionName}": điều kiện "${c.fieldName}" chưa nhập giá trị so sánh.`,
          hint: 'Nhập giá trị so sánh để hoàn thiện biểu thức logic.',
        });
      }
    });
  });

  // Kiểm tra bước cô lập (Isolated steps)
  wf.steps.forEach((s) => {
    const inc = incomingMap.get(s.id) || 0;
    const out = outgoingMap.get(s.id) || 0;

    // Bước bắt đầu chỉ cần out > 0
    if (s.isStart && out === 0) {
      issues.push({
        id: `val-start-no-out-${s.id}`,
        severity: 'error',
        targetType: 'step',
        targetId: s.id,
        message: `Bước bắt đầu "${s.name}" (${s.code}) chưa có đường chuyển ra bước tiếp theo.`,
        hint: 'Nối một connector từ bước này đến bước tiếp theo.',
      });
    }

    // Bước kết thúc chỉ cần inc > 0
    if (s.isEnd && inc === 0) {
      issues.push({
        id: `val-end-no-inc-${s.id}`,
        severity: 'error',
        targetType: 'step',
        targetId: s.id,
        message: `Bước kết thúc "${s.name}" (${s.code}) chưa có đường chuyển dẫn tới.`,
        hint: 'Nối ít nhất một đường dẫn tới bước hoàn thành này.',
      });
    }

    // Bước trung gian không được cô lập
    if (!s.isStart && !s.isEnd) {
      if (inc === 0 && out === 0) {
        issues.push({
          id: `val-isolated-${s.id}`,
          severity: 'error',
          targetType: 'step',
          targetId: s.id,
          message: `Bước "${s.name}" (${s.code}) đang bị cô lập hoàn toàn (không có đường vào và không có đường ra).`,
          hint: 'Nối đường chuyển bước hoặc xóa bước thừa khỏi canvas.',
        });
      } else if (inc === 0) {
        issues.push({
          id: `val-no-in-${s.id}`,
          severity: 'warning',
          targetType: 'step',
          targetId: s.id,
          message: `Bước "${s.name}" (${s.code}) chưa có đường dẫn vào từ bước trước.`,
          hint: 'Thêm đường nối để đảm bảo bước có thể được kích hoạt.',
        });
      } else if (out === 0) {
        issues.push({
          id: `val-no-out-${s.id}`,
          severity: 'warning',
          targetType: 'step',
          targetId: s.id,
          message: `Bước "${s.name}" (${s.code}) là ngõ cụt (chưa có đường chuyển tiếp hoặc không phải bước kết thúc).`,
          hint: 'Nối đường dẫn tiếp theo hoặc đánh dấu là bước kết thúc.',
        });
      }
    }
  });

  return issues;
}
