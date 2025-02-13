package com.codestream.editor


import com.intellij.icons.AllIcons
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonShortcuts
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.editor.actions.IncrementalFindAction
import com.intellij.openapi.editor.event.DocumentEvent
import com.intellij.openapi.editor.event.DocumentListener
import com.intellij.openapi.editor.ex.EditorEx
import com.intellij.openapi.project.DumbAwareAction
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.util.IconLoader
import com.intellij.openapi.util.NlsActions
import com.intellij.ui.AnimatedIcon
import com.intellij.ui.EditorTextField
import com.intellij.ui.ListFocusTraversalPolicy
import com.intellij.ui.TextFieldWithAutoCompletionListProvider
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.labels.LinkLabel
import com.intellij.ui.scale.JBUIScale
import com.intellij.util.textCompletion.TextFieldWithCompletion
import com.intellij.util.ui.JBInsets
import com.intellij.util.ui.JBUI
import com.intellij.util.ui.SingleComponentCenteringLayout
import com.intellij.util.ui.UIUtil
import net.miginfocom.layout.CC
import net.miginfocom.layout.LC
import net.miginfocom.swing.MigLayout
import org.jetbrains.annotations.Nls
import java.awt.Dimension
import java.awt.Rectangle
import java.awt.event.ActionListener
import java.awt.event.ComponentAdapter
import java.awt.event.ComponentEvent
import java.awt.event.HierarchyEvent
import java.awt.event.HierarchyListener
import java.util.concurrent.CompletableFuture
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JLayeredPane
import javax.swing.JPanel
import javax.swing.border.EmptyBorder

class InlineTextField(
    project: Project,
    @NlsActions.ActionText actionName: String,
    private val submitter: ((String) -> CompletableFuture<Unit>),
    private val advancedHandler: ((String) -> CompletableFuture<Unit>),
    private val completionProvider: TextFieldWithAutoCompletionListProvider<InlineTextFieldMentionableUser>,
    authorLabel: ActionLink? = null,
    title: String?,
    onCancel: (() -> Unit)? = null
) : JPanel(null) {
    companion object {
        private val SUBMIT_SHORTCUT_SET = CommonShortcuts.CTRL_ENTER
        private val CANCEL_SHORTCUT_SET = CommonShortcuts.ESCAPE

        private val ICON_SEND = IconLoader.getIcon("/images/inline-send.svg")
        private val ICON_SEND_HOVERED = IconLoader.getIcon("/images/inline-send-hovered.svg")

        fun getEditorTextFieldVerticalOffset() = if (UIUtil.isUnderDarcula() || UIUtil.isUnderIntelliJLaF()) 6 else 4
    }

    private val textField: EditorTextField

    init {
        textField = createTextField(project, actionName)
        val submitButton = createSubmitButton(actionName)
        val cancelButton = createCancelButton()

        val busyLabel = JLabel(AnimatedIcon.Default())
        val textFieldWithOverlay = createTextFieldWithOverlay(textField, submitButton, busyLabel)

        isOpaque = false
        layout = MigLayout(LC().gridGap("0", "0")
            .insets("0", "0", "0", "0")
            .fillX())

        add(JBLabel(title ?: ""), CC().spanX(2))
        add(cancelButton, CC().alignY("top").hideMode(3).wrap())

        if (authorLabel != null) {
            isFocusCycleRoot = true
            isFocusTraversalPolicyProvider = true
            focusTraversalPolicy = ListFocusTraversalPolicy(listOf(textField, authorLabel))
            add(authorLabel, CC().alignY("top").gapRight("${JBUIScale.scale(6)}"))
        }

        add(textFieldWithOverlay, CC().spanX().grow().pushX())

        val advancedLink = ActionLink("Advanced") {
            advancedHandler(textField.text).thenRun {
                onCancel?.invoke()
            }
        }
        add(advancedLink, CC().newline().spanX(3).gapTop("5px").alignX("right"))

        Controller(this, textField, busyLabel, submitButton, cancelButton, onCancel)

        installScrollIfChangedController()
    }

    private fun installScrollIfChangedController() {
        fun scroll() {
            scrollRectToVisible(Rectangle(0, 0, width, height))
        }

        textField.document.addDocumentListener(object : DocumentListener {
            override fun documentChanged(event: DocumentEvent) {
                scroll()
            }
        })

        // previous listener doesn't work properly when text field's size is changed because
        // component is not resized at this moment, so we need to handle resizing too
        // it also produces such behavior: resize of the ancestor will scroll to the field
        addComponentListener(object : ComponentAdapter() {
            override fun componentResized(e: ComponentEvent?) {
                if (UIUtil.isFocusAncestor(this@InlineTextField)) {
                    scroll()
                }
            }
        })
    }

    private fun createTextField(project: Project, @Nls placeHolder: String): EditorTextField {

        return object : TextFieldWithCompletion(project, completionProvider, "", false, true, false) {
        // return object : TextFieldWithAutoCompletion<CSUser>(project, completionProvider, false, null) {
            //always paint pretty border
            override fun updateBorder(editor: EditorEx) = setupBorder(editor)

            override fun createEditor(): EditorEx {
                // otherwise border background is painted from multiple places
                return super.createEditor().apply {
                    //TODO: fix in editor
                    //com.intellij.openapi.editor.impl.EditorImpl.getComponent() == non-opaque JPanel
                    // which uses default panel color
                    component.isOpaque = false
                    //com.intellij.ide.ui.laf.darcula.ui.DarculaEditorTextFieldBorder.paintBorder
                    scrollPane.isOpaque = false
                }
            }
        }.apply {
            putClientProperty(UIUtil.HIDE_EDITOR_FROM_DATA_CONTEXT_PROPERTY, true)
            setOneLineMode(false)
            setPlaceholder(placeHolder)
            addSettingsProvider {
                it.putUserData(IncrementalFindAction.SEARCH_DISABLED, true)
                it.colorsScheme.lineSpacing = 1f
                it.settings.isUseSoftWraps = true
            }
            selectAll()
        }
    }

    private fun createSubmitButton(@NlsActions.ActionText actionName: String) =
        InlineIconButton(
            ICON_SEND, ICON_SEND_HOVERED,
            tooltip = actionName,
            shortcut = SUBMIT_SHORTCUT_SET
        ).apply {
            putClientProperty(UIUtil.HIDE_EDITOR_FROM_DATA_CONTEXT_PROPERTY, true)
        }

    private fun createCancelButton() =
        InlineIconButton(AllIcons.Actions.Close, AllIcons.Actions.CloseHovered,
            tooltip = Messages.getCancelButton(),
            shortcut = CANCEL_SHORTCUT_SET).apply {
            border = JBUI.Borders.empty(getEditorTextFieldVerticalOffset(), 0)
            putClientProperty(UIUtil.HIDE_EDITOR_FROM_DATA_CONTEXT_PROPERTY, true)
        }

    private fun createTextFieldWithOverlay(textField: EditorTextField, button: JComponent, busyLabel: JComponent): JComponent {

        val bordersListener = object : ComponentAdapter(), HierarchyListener {
            override fun componentResized(e: ComponentEvent?) {
                val scrollPane = (textField.editor as? EditorEx)?.scrollPane ?: return
                val buttonSize = button.size
                JBInsets.removeFrom(buttonSize, button.insets)
                scrollPane.viewportBorder = JBUI.Borders.emptyRight(buttonSize.width)
                scrollPane.viewport.revalidate()
            }

            override fun hierarchyChanged(e: HierarchyEvent?) {
                val scrollPane = (textField.editor as? EditorEx)?.scrollPane ?: return
                button.border = EmptyBorder(scrollPane.border.getBorderInsets(scrollPane))
                componentResized(null)
            }
        }

        textField.addHierarchyListener(bordersListener)
        button.addComponentListener(bordersListener)

        val layeredPane = object : JLayeredPane() {
            override fun getPreferredSize(): Dimension {
                return textField.preferredSize
            }

            override fun doLayout() {
                super.doLayout()
                textField.setBounds(0, 0, width, height)
                val preferredButtonSize = button.preferredSize
                button.setBounds(width - preferredButtonSize.width, height - preferredButtonSize.height,
                    preferredButtonSize.width, preferredButtonSize.height)
                busyLabel.bounds = SingleComponentCenteringLayout.getBoundsForCentered(textField, busyLabel)
            }
        }
        layeredPane.add(textField, JLayeredPane.DEFAULT_LAYER, 0)
        layeredPane.add(busyLabel, JLayeredPane.POPUP_LAYER, 1)
        layeredPane.add(button, JLayeredPane.POPUP_LAYER, 2)

        return layeredPane
    }

    private inner class Controller(private val panel: JPanel,
        private val textField: EditorTextField,
        private val busyLabel: JLabel,
        private val submitButton: InlineIconButton,
        cancelButton: InlineIconButton,
        onCancel: (() -> Unit)?) {
        init {
            textField.addDocumentListener(object : DocumentListener {
                override fun documentChanged(event: DocumentEvent) {
                    update()
                    panel.revalidate()
                }
            })

            submitButton.actionListener = ActionListener { submit() }

            object : DumbAwareAction() {
                override fun actionPerformed(e: AnActionEvent) = submit()
            }.registerCustomShortcutSet(SUBMIT_SHORTCUT_SET, textField)

            cancelButton.isVisible = onCancel != null
            if (onCancel != null) {
                cancelButton.actionListener = ActionListener { onCancel() }

                object : DumbAwareAction() {
                    override fun actionPerformed(e: AnActionEvent) {
                        onCancel()
                    }
                }.registerCustomShortcutSet(CANCEL_SHORTCUT_SET, textField)
            }

            update()
        }

        // private fun isSubmitAllowed(): Boolean = !model.isBusy && textField.text.isNotBlank()
        private var submitting = false
        private fun isSubmitAllowed(): Boolean = !submitting && textField.text.isNotBlank()

        private fun submit() {
            if (isSubmitAllowed()) {
                submitting = true
                update()
                ApplicationManager.getApplication().invokeLater {
                    submitter(textField.text).thenRun {
                        submitting = false
                    }
                }
            }
        }

        private fun update() {
            busyLabel.isVisible = submitting
            submitButton.isEnabled = isSubmitAllowed()
        }
    }
}
