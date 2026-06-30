DELETE FROM discussion_events;
DELETE FROM user_questions;
DELETE FROM insights;
DELETE FROM messages;
DELETE FROM participants;
DELETE FROM discussions;

INSERT INTO discussions (id, topic, status, expert_count, summary, created_at, updated_at) VALUES
('sample-001', '生成式 AI 是否会改变知识工作者的核心竞争力？', 'finished', 4, 'AI 会重塑知识工作的流程，但人的判断、抽象和验证能力仍然关键。', '2026-06-30T08:00:00.000Z', '2026-06-30T08:20:00.000Z'),
('sample-002', 'AI 产品是否应该默认解释推荐理由？', 'finished', 4, '解释能力能提升信任，但需要控制信息密度和责任边界。', '2026-06-30T08:30:00.000Z', '2026-06-30T08:50:00.000Z'),
('sample-003', 'AI 会如何影响教育评价？', 'finished', 4, 'AI 能辅助过程性评价，但不能替代教师对成长情境的判断。', '2026-06-30T09:00:00.000Z', '2026-06-30T09:20:00.000Z'),
('sample-004', '企业应该如何建立 AI 使用规范？', 'finished', 4, '规范需要同时覆盖效率、数据安全、责任归属和员工培训。', '2026-06-30T09:30:00.000Z', '2026-06-30T09:50:00.000Z'),
('sample-005', 'AI Agent 会改变产品团队协作方式吗？', 'finished', 4, 'Agent 会改变交付节奏，但跨角色对齐仍是产品团队的核心能力。', '2026-06-30T10:00:00.000Z', '2026-06-30T10:20:00.000Z');

INSERT INTO participants (id, discussion_id, role, name, title, profession, stance, focus, color, status, public_thought_summary, created_at) VALUES
('sample-001-host', 'sample-001', 'host', '林知远', '圆桌主持人', '科技评论人', '保持中立并推动讨论深入。', '议题边界、追问、总结', '#1769aa', 'waiting', '推动观点交锋并沉淀结论。', '2026-06-30T08:00:00.000Z'),
('sample-001-expert-1', 'sample-001', 'expert', '周砚', 'AI 产品负责人', '产品管理', 'AI 会重塑工作流。', '产品落地、组织协作', '#c77831', 'waiting', '关注 AI 如何进入真实流程。', '2026-06-30T08:00:00.000Z'),
('sample-001-expert-2', 'sample-001', 'expert', '许棠', '认知科学研究员', '研究', '核心竞争力会转向判断与验证。', '认知负荷、学习迁移', '#237a57', 'waiting', '关注人的判断能力。', '2026-06-30T08:00:00.000Z'),
('sample-001-expert-3', 'sample-001', 'expert', '陈澈', '企业战略顾问', '战略咨询', '组织能力会重新分层。', '组织结构、岗位变化', '#7a4fb3', 'waiting', '关注长期竞争力。', '2026-06-30T08:00:00.000Z'),
('sample-001-expert-4', 'sample-001', 'expert', '沈葭', '数据伦理研究者', '数据治理', '技术使用需要责任边界。', '透明度、公平性', '#b54708', 'waiting', '关注治理和风险。', '2026-06-30T08:00:00.000Z');

INSERT INTO participants (id, discussion_id, role, name, title, profession, stance, focus, color, status, public_thought_summary, created_at) VALUES
('sample-002-host', 'sample-002', 'host', '林知远', '圆桌主持人', '科技评论人', '保持中立并推动讨论深入。', '解释边界、信任、总结', '#1769aa', 'waiting', '推动解释与体验之间的平衡。', '2026-06-30T08:30:00.000Z'),
('sample-002-expert-1', 'sample-002', 'expert', '尹乔', '推荐系统工程师', '算法工程', '解释推荐理由能提升可控感。', '算法透明、用户反馈', '#c77831', 'waiting', '关注解释与模型表现。', '2026-06-30T08:30:00.000Z'),
('sample-002-expert-2', 'sample-002', 'expert', '陆遥', 'UX 研究员', '用户研究', '解释过载会增加认知负担。', '可理解性、交互成本', '#237a57', 'waiting', '关注解释是否真的有用。', '2026-06-30T08:30:00.000Z'),
('sample-002-expert-3', 'sample-002', 'expert', '陈澈', '企业战略顾问', '战略咨询', '解释能力应服务商业目标。', '转化、信任、风险', '#7a4fb3', 'waiting', '关注业务收益。', '2026-06-30T08:30:00.000Z'),
('sample-002-expert-4', 'sample-002', 'expert', '沈葭', '数据伦理研究者', '数据治理', '解释是责任链条的一部分。', '合规、责任、透明', '#b54708', 'waiting', '关注治理责任。', '2026-06-30T08:30:00.000Z'),
('sample-003-host', 'sample-003', 'host', '林知远', '圆桌主持人', '科技评论人', '保持中立并推动讨论深入。', '教育场景、追问、总结', '#1769aa', 'waiting', '推动技术与教育目标对齐。', '2026-06-30T09:00:00.000Z'),
('sample-003-expert-1', 'sample-003', 'expert', '顾明', '一线教育实践者', '教育', 'AI 可以辅助过程性评价。', '课堂实践、评价方式', '#0f766e', 'waiting', '关注教学可用性。', '2026-06-30T09:00:00.000Z'),
('sample-003-expert-2', 'sample-003', 'expert', '许棠', '认知科学研究员', '研究', '评价应关注学习迁移。', '认知发展、能力迁移', '#237a57', 'waiting', '关注学生真实成长。', '2026-06-30T09:00:00.000Z'),
('sample-003-expert-3', 'sample-003', 'expert', '周砚', 'AI 产品负责人', '产品管理', 'AI 评价工具需要明确使用边界。', '产品落地、教师工作流', '#c77831', 'waiting', '关注工具如何进入学校。', '2026-06-30T09:00:00.000Z'),
('sample-003-expert-4', 'sample-003', 'expert', '沈葭', '数据伦理研究者', '数据治理', '教育数据使用必须谨慎。', '隐私、公平、责任', '#b54708', 'waiting', '关注未成年人数据保护。', '2026-06-30T09:00:00.000Z'),
('sample-004-host', 'sample-004', 'host', '林知远', '圆桌主持人', '科技评论人', '保持中立并推动讨论深入。', '规范、风险、总结', '#1769aa', 'waiting', '推动规范从口号变成流程。', '2026-06-30T09:30:00.000Z'),
('sample-004-expert-1', 'sample-004', 'expert', '陈澈', '企业战略顾问', '战略咨询', 'AI 规范应与组织目标绑定。', '治理结构、组织能力', '#7a4fb3', 'waiting', '关注组织落地。', '2026-06-30T09:30:00.000Z'),
('sample-004-expert-2', 'sample-004', 'expert', '沈葭', '数据伦理研究者', '数据治理', '数据安全和责任归属不可缺席。', '合规、安全、责任', '#b54708', 'waiting', '关注风险边界。', '2026-06-30T09:30:00.000Z'),
('sample-004-expert-3', 'sample-004', 'expert', '周砚', 'AI 产品负责人', '产品管理', '规范需要嵌入工具和流程。', '产品机制、审批流程', '#c77831', 'waiting', '关注实际可执行性。', '2026-06-30T09:30:00.000Z'),
('sample-004-expert-4', 'sample-004', 'expert', '韩越', '产业投资分析师', '投资分析', '规范会影响企业 AI 采用速度。', '成本、效率、竞争格局', '#4f46e5', 'waiting', '关注产业效率。', '2026-06-30T09:30:00.000Z'),
('sample-005-host', 'sample-005', 'host', '林知远', '圆桌主持人', '科技评论人', '保持中立并推动讨论深入。', 'Agent、协作、总结', '#1769aa', 'waiting', '推动协作方式讨论。', '2026-06-30T10:00:00.000Z'),
('sample-005-expert-1', 'sample-005', 'expert', '周砚', 'AI 产品负责人', '产品管理', 'Agent 会改变产品团队交付节奏。', '产品流程、需求拆解', '#c77831', 'waiting', '关注产品工作流。', '2026-06-30T10:00:00.000Z'),
('sample-005-expert-2', 'sample-005', 'expert', '陈澈', '企业战略顾问', '战略咨询', 'Agent 会重构组织协作边界。', '组织结构、岗位协作', '#7a4fb3', 'waiting', '关注组织形态。', '2026-06-30T10:00:00.000Z'),
('sample-005-expert-3', 'sample-005', 'expert', '尹乔', '推荐系统工程师', '算法工程', 'Agent 需要可靠的任务分解和监控。', '系统可靠性、反馈回路', '#237a57', 'waiting', '关注工程可控性。', '2026-06-30T10:00:00.000Z'),
('sample-005-expert-4', 'sample-005', 'expert', '陆遥', 'UX 研究员', '用户研究', '协作体验不能只看自动化率。', '团队体验、信任建立', '#b54708', 'waiting', '关注人机协作体验。', '2026-06-30T10:00:00.000Z');

INSERT INTO messages (id, discussion_id, speaker_id, speaker_name, speaker_title, content, message_type, created_at) VALUES
('sample-001-m1', 'sample-001', 'sample-001-host', '林知远', '圆桌主持人', '今天我们讨论生成式 AI 对知识工作者核心竞争力的影响。', 'opening', '2026-06-30T08:01:00.000Z'),
('sample-001-m2', 'sample-001', 'sample-001-expert-1', '周砚', 'AI 产品负责人', 'AI 会先改变工作流，把许多执行性任务压缩成可编排的步骤。', 'speech', '2026-06-30T08:03:00.000Z'),
('sample-001-m3', 'sample-001', 'sample-001-expert-2', '许棠', '认知科学研究员', '真正稀缺的能力会转向问题定义、判断和验证。', 'speech', '2026-06-30T08:05:00.000Z');

INSERT INTO insights (id, discussion_id, type, content, source_message_ids, created_at) VALUES
('sample-001-c1', 'sample-001', 'consensus', 'AI 会显著改变知识工作的流程。', '["sample-001-m2"]', '2026-06-30T08:06:00.000Z'),
('sample-001-d1', 'sample-001', 'disagreement', '核心竞争力是被替代，还是被重新定义，仍存在分歧。', '["sample-001-m2","sample-001-m3"]', '2026-06-30T08:07:00.000Z');

INSERT INTO user_questions (id, discussion_id, content, status, created_at) VALUES
('sample-001-q1', 'sample-001', '这会不会让初级岗位更难获得成长机会？', 'addressed', '2026-06-30T08:08:00.000Z');
