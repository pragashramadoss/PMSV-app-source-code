<?php
if (!defined('ABSPATH')) exit;

add_action('admin_menu', function () {
    add_management_page(
        'PMSV Discussions',
        'PMSV Discussions',
        'manage_options',
        'pmsv-discussions',
        'pmsv_wp_forum_admin_page'
    );
});

add_action('admin_init', 'pmsv_wp_forum_admin_action');

function pmsv_wp_forum_admin_action() {
    if (!is_admin() || !current_user_can('manage_options') || empty($_POST['pmsv_forum_action'])) return;
    check_admin_referer('pmsv_forum_admin');

    $action = sanitize_key(wp_unslash($_POST['pmsv_forum_action']));
    $type = sanitize_key(wp_unslash($_POST['target_type'] ?? ''));
    $id = absint($_POST['target_id'] ?? 0);
    if (!in_array($type, ['question','answer'], true) || $id < 1) return;

    global $wpdb;
    $questions = pmsv_wp_table('questions');
    $answers = pmsv_wp_table('answers');
    $reports = pmsv_wp_table('reports');
    $table = $type === 'question' ? $questions : $answers;

    if ($action === 'hide' || $action === 'restore') {
        $status = $action === 'hide' ? 'hidden' : 'published';
        $wpdb->update($table, ['status'=>$status], ['id'=>$id], ['%s'], ['%d']);
        if ($action === 'hide') {
            $wpdb->update($reports, ['status'=>'resolved'], ['target_type'=>$type,'target_id'=>$id], ['%s'], ['%s','%d']);
        }
    } elseif ($action === 'delete') {
        if ($type === 'question') {
            $answer_ids = $wpdb->get_col($wpdb->prepare("SELECT id FROM $answers WHERE question_id=%d", $id));
            if ($answer_ids) {
                $placeholders = implode(',', array_fill(0, count($answer_ids), '%d'));
                $wpdb->query($wpdb->prepare("DELETE FROM $reports WHERE target_type='answer' AND target_id IN ($placeholders)", ...array_map('intval',$answer_ids)));
            }
            $wpdb->delete($answers, ['question_id'=>$id], ['%d']);
        }
        $wpdb->delete($reports, ['target_type'=>$type,'target_id'=>$id], ['%s','%d']);
        $wpdb->delete($table, ['id'=>$id], ['%d']);
    } elseif ($action === 'resolve') {
        $wpdb->update($reports, ['status'=>'resolved'], ['target_type'=>$type,'target_id'=>$id], ['%s'], ['%s','%d']);
    }

    wp_safe_redirect(add_query_arg(['page'=>'pmsv-discussions','updated'=>'1'], admin_url('tools.php')));
    exit;
}

function pmsv_wp_forum_admin_form($action,$type,$id,$label,$class='button') {
    ?>
    <form method="post" style="display:inline-block;margin:0 4px 4px 0" <?php echo $action==='delete' ? 'onsubmit="return confirm(\'Delete permanently?\')"' : ''; ?>>
        <?php wp_nonce_field('pmsv_forum_admin'); ?>
        <input type="hidden" name="pmsv_forum_action" value="<?php echo esc_attr($action); ?>">
        <input type="hidden" name="target_type" value="<?php echo esc_attr($type); ?>">
        <input type="hidden" name="target_id" value="<?php echo esc_attr((string)$id); ?>">
        <button type="submit" class="<?php echo esc_attr($class); ?>"><?php echo esc_html($label); ?></button>
    </form>
    <?php
}

function pmsv_wp_forum_admin_page() {
    if (!current_user_can('manage_options')) return;
    global $wpdb;
    $q = pmsv_wp_table('questions');
    $a = pmsv_wp_table('answers');
    $r = pmsv_wp_table('reports');

    $questions = $wpdb->get_results(
        "SELECT q.*, 
         (SELECT COUNT(*) FROM $a a WHERE a.question_id=q.id) answer_count,
         (SELECT COUNT(*) FROM $r r WHERE r.target_type='question' AND r.target_id=q.id AND r.status='open') report_count
         FROM $q q ORDER BY q.created_at DESC LIMIT 100", ARRAY_A
    );
    $answers = $wpdb->get_results(
        "SELECT a.*, q.title question_title,
         (SELECT COUNT(*) FROM $r r WHERE r.target_type='answer' AND r.target_id=a.id AND r.status='open') report_count
         FROM $a a LEFT JOIN $q q ON q.id=a.question_id ORDER BY a.created_at DESC LIMIT 100", ARRAY_A
    );
    $open_reports = (int)$wpdb->get_var("SELECT COUNT(*) FROM $r WHERE status='open'");
    ?>
    <div class="wrap">
      <h1>PMSV Discussions</h1>
      <?php if (!empty($_GET['updated'])): ?><div class="notice notice-success is-dismissible"><p>Discussion moderation updated.</p></div><?php endif; ?>
      <p>Moderate text-only Food Safety, Quality and Process Excellence discussions. <strong><?php echo esc_html((string)$open_reports); ?></strong> open report<?php echo $open_reports===1?'':'s'; ?>.</p>

      <h2>Questions</h2>
      <table class="widefat striped">
        <thead><tr><th>Status</th><th>Topic</th><th>Question</th><th>Author</th><th>Answers</th><th>Reports</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
        <?php if (!$questions): ?><tr><td colspan="8">No questions yet.</td></tr><?php endif; ?>
        <?php foreach ($questions as $row): ?>
          <tr>
            <td><?php echo esc_html($row['status']); ?></td>
            <td><?php echo esc_html(str_replace('-', ' ', $row['category'])); ?></td>
            <td><strong><?php echo esc_html($row['title']); ?></strong><br><small><?php echo esc_html(wp_trim_words($row['body'],24,'…')); ?></small></td>
            <td><?php echo esc_html($row['author']); ?></td>
            <td><?php echo esc_html((string)$row['answer_count']); ?></td>
            <td><?php echo (int)$row['report_count']>0 ? '<strong style="color:#b32d2e">'.esc_html((string)$row['report_count']).'</strong>' : '0'; ?></td>
            <td><?php echo esc_html(wp_date('j M Y H:i',(int)$row['created_at'])); ?></td>
            <td>
              <?php if ($row['status']==='published') pmsv_wp_forum_admin_form('hide','question',$row['id'],'Hide'); else pmsv_wp_forum_admin_form('restore','question',$row['id'],'Restore'); ?>
              <?php if ((int)$row['report_count']>0) pmsv_wp_forum_admin_form('resolve','question',$row['id'],'Resolve reports'); ?>
              <?php pmsv_wp_forum_admin_form('delete','question',$row['id'],'Delete','button button-link-delete'); ?>
            </td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>

      <h2 style="margin-top:32px">Answers</h2>
      <table class="widefat striped">
        <thead><tr><th>Status</th><th>Question</th><th>Answer</th><th>Author</th><th>Reports</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
        <?php if (!$answers): ?><tr><td colspan="7">No answers yet.</td></tr><?php endif; ?>
        <?php foreach ($answers as $row): ?>
          <tr>
            <td><?php echo esc_html($row['status']); ?></td>
            <td><?php echo esc_html($row['question_title'] ?: 'Question removed'); ?></td>
            <td><?php echo esc_html(wp_trim_words($row['body'],28,'…')); ?></td>
            <td><?php echo esc_html($row['author']); ?></td>
            <td><?php echo (int)$row['report_count']>0 ? '<strong style="color:#b32d2e">'.esc_html((string)$row['report_count']).'</strong>' : '0'; ?></td>
            <td><?php echo esc_html(wp_date('j M Y H:i',(int)$row['created_at'])); ?></td>
            <td>
              <?php if ($row['status']==='published') pmsv_wp_forum_admin_form('hide','answer',$row['id'],'Hide'); else pmsv_wp_forum_admin_form('restore','answer',$row['id'],'Restore'); ?>
              <?php if ((int)$row['report_count']>0) pmsv_wp_forum_admin_form('resolve','answer',$row['id'],'Resolve reports'); ?>
              <?php pmsv_wp_forum_admin_form('delete','answer',$row['id'],'Delete','button button-link-delete'); ?>
            </td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </div>
    <?php
}
